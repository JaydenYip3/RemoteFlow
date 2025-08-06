"use client"

import Device from "@/types/device";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DevicePage() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [passwordModal, setPasswordModal] = useState(true)
    const [error, setError] = useState("")
    const params = useParams();
    const id = params.id as string;
    const [device, setDevice] = useState<Device | null>(null);

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

        const login = await fetch(`${API_BASE_URL}/login-device`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ip: device?.ip,
                username: device?.deviceUsername,
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
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <Input name="password" type="password" placeholder="Password" />
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