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
}



function EditDeviceModal({ open, onOpenChange , device}: EditDeviceModalProps) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [deviceName, setDeviceName] = useState(device?.name || "");
    const [error, setError] = useState("")
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

    const handleSave = async (device: Device) => {
        if (deviceName === "") {
            setError("Device name is required");
            return;
        }
        const response = await fetch(`${API_BASE_URL}/edit-device`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ device, name: deviceName }),
        });
        const data = await response.json();

        if (data.message === "Device edited") {
            setError("");
            onOpenChange(false);
        } else {
            setError(data.message);
        }
    }

    const handleDelete = async (ip: string) => {

        const response = await fetch(`${API_BASE_URL}/delete-device`, {
            method: 'POST',
            body: JSON.stringify({ ip }),
        });
        const data = await response.json();
        if (data.message === "Device deleted") {
            onOpenChange(false);
            setConfirmDeleteModal(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Edit Device</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Edit the device details
                    </DialogDescription>
                    <form className="space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        handleSave(device);
                    }}>
                        <div className="space-y-2">
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
                            {error && (
                                <p className="text-sm text-red-500 mt-1">{error}</p>
                            )}
                        </div>
                    </form>
                    <div className="flex flex-row justify-between">
                        <div className='flex flex-col justify-between w-full'>
                            <div className='flex flex-row gap-2'>
                                <Button className='flex-1' type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button className='flex-1' type="submit" onClick={() => handleSave(device)}>Save</Button>
                            </div>
                            <Button className='mt-4 bg-red-500 hover:bg-red-600 text-white' type="submit" onClick={() => setConfirmDeleteModal(true)}>Delete</Button>
                        </div>
                    </div>
                </DialogContent>
        </Dialog>
        <Dialog open={confirmDeleteModal} onOpenChange={setConfirmDeleteModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Device</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Are you sure you want to delete this device?
                </DialogDescription>
                <div className="flex flex-row justify-between">
                    <Button type="button" onClick={() => setConfirmDeleteModal(false)}>Cancel</Button>
                    <Button type="submit" onClick={() => handleDelete(device.ip)}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
    </>
    )
}

export default EditDeviceModal;