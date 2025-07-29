'use client'

import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Wifi } from 'lucide-react';

interface AvailableIpsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectIp: (ip: string) => void;
}

export default function AvailableIpsModal({ open, onOpenChange, onSelectIp }: AvailableIpsModalProps) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [ips, setIps] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAvailableIps = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/get-ips`);
            const data = await response.json();
            setIps(data.ips || []);
        } catch (error) {
            console.error('Failed to fetch available IPs:', error);
            setIps([]);
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        if (open) {
            fetchAvailableIps();
        }
    }, [open, fetchAvailableIps]);

    const handleSelectIp = (ip: string) => {
        onSelectIp(ip);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Wifi className="w-5 h-5" />
                        Available IP Addresses
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select an IP address from the network scan
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-2">Scanning network...</p>
                        </div>
                    ) : ips.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {ips.map((ip) => (
                                <Card key={ip} className="border-border hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Monitor className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{ip}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleSelectIp(ip)}
                                                className="h-8"
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No available IP addresses found</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchAvailableIps}
                                className="mt-2"
                            >
                                Refresh Scan
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={fetchAvailableIps}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Scanning...' : 'Refresh'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}