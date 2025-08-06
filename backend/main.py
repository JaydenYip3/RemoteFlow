from traceback import print_tb

import paramiko
from sqlalchemy import true
from schemas import EditDevicePayload, Device, LoginDevicePayload
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import availableDevices, devices
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import os, time
import jwt
from database import SessionLocal, engine
from models import Base
from wakeonlan import send_magic_packet


import asyncio

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

@app.get("/get-device/{id}")
def get_device(id: int):
    db = SessionLocal()
    print(id)
    device = db.query(devices).filter(devices.id == id).first()
    return {"device": device}

@app.get("/get-devices")
async def get_devices():
    db = SessionLocal()
    try:
        all_devices = db.query(devices).all()
        devices_list = []
        for device in all_devices:
            # Update device status with ping
            if ping(device.ip):
                device.status = True
            else:
                device.status = False

            # Convert to dictionary for JSON serialization
            device_dict = {
                "id": device.id,
                "ip": device.ip,
                "name": device.name,
                "OS": device.OS,
                "status": device.status,
                "deviceUsername": device.deviceUsername,
                "MAC": device.MAC
            }
            devices_list.append(device_dict)

        db.commit()  # Save updated status to database
        return {"devices": devices_list}
    finally:
        db.close()

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
    import subprocess
    import platform
    try:
        # Different ping commands for different OS
        if platform.system().lower() == 'windows':
            result = subprocess.run(['ping', '-n', '1', '-w', '1000', ip], capture_output=True, timeout=1)
        elif platform.system().lower() == 'darwin':
            # macOS
            result = subprocess.run(['ping', '-c', '1', '-W', '1000', ip], capture_output=True, timeout=1)
        else:
            # Linux
            result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], capture_output=True, timeout=1)
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        return False
    except Exception:
        return False


@app.post("/wake-device")
def wake(device: Device):
    db = SessionLocal()
    try:

        if ping(device.ip):
            return {"message": "Device already woken up"}

        device_record = db.query(devices).filter(devices.ip == device.ip).first()
        if not device_record:
            raise HTTPException(status_code=404, detail="Device not found")

        MAC = device_record.MAC
        if not MAC:
            raise HTTPException(status_code=400, detail="Device MAC address not available")

        send_magic_packet(MAC)

        time.sleep(5)

        if ping(device.ip):
            return {"message": "Device woken up"}
        else:
            return {"message": "Device not woken up"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/edit-device")
def edit_device(payload: EditDevicePayload):
    db = SessionLocal()
    device = db.query(devices).filter(devices.ip == payload.device.ip).first()
    device.name = payload.name
    db.commit()
    return {"message": "Device edited"}

@app.post("/delete-device")
async def delete_device(request: Request):
    data = await request.json()
    ip = data.get("ip")
    db = SessionLocal()
    device = db.query(devices).filter(devices.ip == ip).first()
    db.delete(device)
    db.commit()
    return {"message": "Device deleted"}

@app.post("/login-device")
def loginDevice(payload: LoginDevicePayload):

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(
            hostname=payload.device.ip,
            port=22,
            username=payload.device.deviceUsername,
            password=payload.password,
        )
        ssh.close()
        return {"message": True}
    except paramiko.AuthenticationException:
        return {"message": False}
    except paramiko.SSHException as e:
        return {"message": False}
    except Exception as e:
        return {"message": False}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received: {data}")


