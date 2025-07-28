from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Device, availableDevices, devices
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import os, time
import jwt
from database import SessionLocal, engine
from models import Base

# Create tables once
Base.metadata.create_all(bind=engine)

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods, adjust as needed
    allow_headers=["*"],  # Allows all headers, adjust as needed
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}

async def get_all_available_devices() -> dict:
    """Scrape router interface using Playwright to handle JavaScript-rendered content"""
    load_dotenv()  # Load from .env file

    USERNAME = os.getenv("USER_LOGIN_USERNAME")
    PASSWORD = os.getenv("USER_LOGIN_PASSWORD")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("http://10.0.0.1")

        await page.fill("input[name='username']", USERNAME)
        await page.fill("input[name='password']", PASSWORD)
        await page.click("input[type='submit'][value='Login']")

        await page.wait_for_load_state("networkidle")  # Wait until page loads
        await page.goto("http://10.0.0.1/connected_devices_computers.jst")

        html = await page.content()

        await browser.close()

    soup = BeautifulSoup(html, 'html.parser')

    device_blocks = soup.find_all('div', class_='device-info device-hide')

    ips = []
    macs = []

    for block in device_blocks:
        # Find all dd elements in the block
        dl = block.find("dl")
        if not dl:
            continue


        ipv4 = None
        mac = None

        for text in dl.stripped_strings:

            # Check if it's an IPv4 address
            if text.count('.') == 3 and len(text.split('.')) == 4:
                try:
                    # Validate IPv4 format
                    parts = text.split('.')
                    if all(0 <= int(part) <= 255 for part in parts):
                        ipv4 = text
                except ValueError:
                    pass

            # Check if it's a MAC address
            elif ':' in text and len(text.split(':')) == 6:
                # Validate MAC format
                if all(len(part) == 2 for part in text.split(':')):
                    mac = text

        ips.append(ipv4)
        macs.append(mac)

    return {"devices": {"ips": ips, "macs": macs}}

async def valid_device(ip: str) -> str:
    db = SessionLocal()
    try:
        device = db.query(availableDevices).filter(availableDevices.ip == ip).first()
        if device:
            return device.MAC
        else:
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/update-devices")
async def update_devices():
    # Create a database session
    db = SessionLocal()
    try:
        result = await get_all_available_devices()
        for ip, mac in zip(result["devices"]["ips"], result["devices"]["macs"]):
            device = availableDevices(ip=ip, MAC=mac)
            if db.query(availableDevices).filter(availableDevices.ip == ip, availableDevices.MAC == mac).first() is None:
                db.add(device)
        db.commit()
        return {"devices": result}
    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceback": traceback.format_exc()}
    finally:
        db.close()

@app.post("/add-device")
async def add_device(device: Device):
    db = SessionLocal()
    MAC = await valid_device(device.ip)
    if MAC is not None:

        device = devices(device, MAC)
        db.add(device)
        db.commit()
        return {"device_added": True}
    else:
        return {"device_added": False}

@app.get("/get-devices")
async def get_devices():
    db = SessionLocal()
    all_devices = db.query(devices).all()
    return {"devices": all_devices}

@app.get("/get-ips")
async def get_ips():
    db = SessionLocal()
    all_ips = db.query(availableDevices).all()
    ips = [device.ip for device in all_ips]
    return {"ips": ips}

@app.post("/sign-in")
def sign_in(password: str):
    if password == os.getenv("USER_LOGIN_PASSWORD"):
        token = jwt.encode({"user": "admin"}, os.getenv("JWT_SECRET"), algorithm="HS256")
        return {"token": token}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")


def ping(ip: str):
    response_time = ping(ip)
    if response_time:
        return True
    else:
        return False


@app.post("/wake-device")
def wake(device: Device):
    db = SessionLocal()
    device = db.query(availableDevices).filter(availableDevices.ip == device.ip).first()
    MAC = device.MAC

    send_magic_packet(MAC)

    time.sleep(5)

    if ping(device.ip):
        return {"message": "Device woken up"}
    else:
        return {"message": "Device not woken up"}


@app.post("/edit-device")
def edit_device(device: Device, name: str):
    db = SessionLocal()
    device = db.query(devices).filter(devices.ip == device.ip).first()
    device.name = name
    db.commit()
    return {"message": "Device edited"}
