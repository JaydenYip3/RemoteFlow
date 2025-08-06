'use client'

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Wifi } from 'lucide-react';
import AvailableIpsModal from './AvailableIpsModal';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddDeviceModal({ open, onOpenChange }: AddDeviceModalProps) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [username, setUsername] = useState("root");
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIp, setSelectedIp] = useState('');
    const [isAvailableIpsOpen, setIsAvailableIpsOpen] = useState(false);

    const OS = ["Windows", "Linux", "macOS"];


    async function validate_inputs(deviceOS: string, deviceName: string, ip: string, deviceUsername: string): Promise<boolean> {
        const response = await fetch(`${API_BASE_URL}/add-device`,
            {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({
                     ip: ip || '', name: deviceName || '', OS: deviceOS || '', status: false, deviceUsername: deviceUsername || ''
                })
            }
        )
        const data = await response.json();
        console.log(data);
        return response.ok ? true : false;
    }


    async function testValid(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const form = e.target as HTMLFormElement;
        const deviceName = (form.elements.namedItem('deviceName') as HTMLInputElement)?.value;
        const deviceOS = (form.elements.namedItem('deviceOS') as HTMLInputElement)?.value;
        const ip = (form.elements.namedItem('ip') as HTMLInputElement)?.value || '';
        const deviceUsername = (form.elements.namedItem('username') as HTMLInputElement)?.value || '';

        try {
            if (await validate_inputs(deviceOS, deviceName, ip, deviceUsername)) {
                // Success - close modal and reset form
                form.reset();
                setUsername("root");
                onOpenChange(false);
            } else {
                setError('Failed to add device. Please check your inputs and try again.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    async function update_devices() {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/update-devices`, {
            method: "GET",
        });
        if (response.ok) {
            setError('Devices updated successfully');
        } else {
            setError('Failed to update devices. Please try again.');
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Device
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Connect a new device to your remote control center
                    </DialogDescription>
                </DialogHeader>


                <form className="space-y-4" onSubmit={testValid}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Device Name</label>
                        <Input
                            name="deviceName"
                            type="text"
                            placeholder="Enter device name"
                            className="bg-input border-border text-foreground"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-foreground">Operating System</label>
                        <Select
                            name="deviceOS"
                            required
                        >
                            <SelectTrigger className="w-full bg-input border-border text-foreground">
                                <SelectValue placeholder="Operating System" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Operating Systems</SelectLabel>
                                    {OS.map((os) => {
                                        return (
                                            <SelectItem key={os} value={os}>{os}</SelectItem>
                                        )
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">IP Address</label>
                        <div className="flex gap-2">
                            <Input
                                name="ip"
                                type="text"
                                placeholder="192.168.1.100"
                                value={selectedIp}
                                onChange={(e) => setSelectedIp(e.target.value)}
                                className="bg-input border-border text-foreground flex-1"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setIsAvailableIpsOpen(true)}
                                className="shrink-0"
                            >
                                <Wifi className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Username</label>
                        <Input
                            name="username"
                            type="text"
                            placeholder="Device username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            className="bg-input border-border text-foreground"
                            required
                        />
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            <strong>Note:</strong> You will need to enter the password manually during connection for security reasons.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">

                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => update_devices()}
                            disabled={isLoading}
                        >
                            Update System
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add Device'}
                        </Button>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                </form>
            </DialogContent>

            <AvailableIpsModal
                open={isAvailableIpsOpen}
                onOpenChange={setIsAvailableIpsOpen}
                onSelectIp={setSelectedIp}
            />
        </Dialog>
    );
}