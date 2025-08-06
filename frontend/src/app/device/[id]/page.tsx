"use client"

import Device from "@/types/device";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DevicePage() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [passwordModal, setPasswordModal] = useState(true)
    const [error, setError] = useState("")
    const path = window.location.pathname;
    const id = path.split('/').pop();
    const [device, setDevice] = useState<Device | null>(null);
    console.log(id, device)

    useEffect(() => {
        const fetchDevice = async () => {
            const response = await fetch(`${API_BASE_URL}/get-device/${id}`);
            const data = await response.json();
            setDevice(data.device);
        }
        fetchDevice();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        console.log(device)
        const login = await fetch(`${API_BASE_URL}/login-device`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                device: device,
                password: (e.target as HTMLFormElement).password.value
            })
        })
        const result = await login.json()

        if (result.message) {
            setError("")
            setPasswordModal(false)
        } else {
            setError("Invalid password")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Dialog open={passwordModal} onOpenChange={() => setError("Need to enter password")}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Password</DialogTitle>
                        <form onSubmit={handleSubmit}>
                            <Input name="password" placeholder="Password" />
                            <div className="flex flex-row gap-2 w-full">
                            <Button className="flex-1" type="submit">Submit</Button>
                        </div>
                        </form>

                        {
                            error && (
                                <div className="text-red-500">{`*${error}`}</div>
                            )
                        }
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    )
}