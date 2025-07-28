from sqlalchemy import Column, String, Boolean, DateTime
import uuid
from schemas import Device
from database import Base

# SQLAlchemy Model
class devices(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip = Column(String, unique=True, nullable=False)
    name = Column(String)
    OS = Column(String)
    status = Column(Boolean, default=False)
    deviceUsername = Column(String)
    MAC = Column(String)

    def __init__(self, device: Device, MAC: str):
        self.id = str(uuid.uuid4())  # Generate a new UUID as string
        self.ip = device.ip
        self.name = device.name
        self.OS = device.OS
        self.status = device.status
        self.deviceUsername = device.deviceUsername
        self.MAC = MAC

    def __repr__(self):
        return f"<Device(ip={self.ip}, name={self.name}, OS={self.OS}, status={self.status}, deviceUsername={self.deviceUsername})>"

class availableDevices(Base):
    __tablename__ = "availableDevices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip = Column(String, unique=True, nullable=False)
    MAC = Column(String, unique=True, nullable=False)

    def __init__(self, ip: str, MAC: str):
        self.id = str(uuid.uuid4())  # Generate a new UUID as string
        self.ip = ip
        self.MAC = MAC





