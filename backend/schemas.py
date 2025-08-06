from pydantic import BaseModel
from typing import Optional

class Device(BaseModel):
    ip: str
    name: Optional[str] = None
    OS: Optional[str] = None
    status: Optional[bool] = False
    deviceUsername: Optional[str] = None

class EditDevicePayload(BaseModel):
    device: Device
    name: str

class LoginDevicePayload(BaseModel):
    ip: str
    username: str
    password: str