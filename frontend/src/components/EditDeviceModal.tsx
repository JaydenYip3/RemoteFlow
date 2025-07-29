'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Device from '@/types/device';
import { useState } from 'react';


interface EditDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    device: Device;
    onDeviceUpdated?: () => void;
}


export default function EditDeviceModal({ open, onOpenChange, device, onDeviceUpdated }: EditDeviceModalProps) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [deviceName, setDeviceName] = useState("");
    const [error, setError] = useState("")

    const handleSave = async (device: Device) => {
        if (deviceName === "") {
            setError("Device name is required");
            return;
        }
        const response = await fetch(`${API_BASE_URL}/edit-device`, {
            method: 'POST',
            body: JSON.stringify({ device, deviceName }),
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            onOpenChange(false);
            onDeviceUpdated?.();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Edit Device</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Edit the device details
                </DialogDescription>
                <form className="space-y-4" onSubmit={() => {}}>
                    <div className="space-y-2"></div>
                        <label className="text-sm font-medium text-foreground">Device Name</label>
                        <Input
                            name="deviceName"
                            type="text"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="Enter device name"
                            className="bg-input border-border text-foreground"
                            required
                        />
                </form>
            <div className="flex flex-row justify-between">
                <Button onClick= {() => onOpenChange(false)} >Cancel</Button>
                <Button onClick={() => handleSave(device)}>Save</Button>
            </div>
            </DialogContent>


        </Dialog>
    )
}