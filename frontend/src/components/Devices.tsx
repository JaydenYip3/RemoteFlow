'use client'

import React, { useEffect, useState } from 'react';
import AddDeviceButton from "./Add_device";
import AddDeviceModal from "./AddDeviceModal";
import EditDeviceModal from "./EditDeviceModal";
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Pencil } from 'lucide-react';
import Device from '@/types/device';
import { useRouter } from 'next/navigation';

export default function Devices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [devices, setDevices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await fetch(`${API_BASE_URL}/get-devices`);
      const data = await response.json();
      setDevices(data.devices);
    };
    fetchDevices();
  }, [isModalOpen, API_BASE_URL]);

  const handleWake = async (device: Device) => {
    const response = await fetch(`${API_BASE_URL}/wake-device`, {
      method: 'POST',
      body: JSON.stringify({ device }),
    });
    const data = await response.json();
    console.log(data);
  }

  const handleConnect = async (device: Device) => {
    router.push(`/device/${device.id}`);
  }
  const handleEditClick = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  const handleDeviceUpdated = () => {
    // Refresh devices list after update
    const fetchDevices = async () => {
      const response = await fetch(`${API_BASE_URL}/get-devices`);
      const data = await response.json();
      setDevices(data.devices);
    };
    fetchDevices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Connected Devices
        </h2>
        <AddDeviceButton onClick={() => setIsModalOpen(true)} />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_4fr_1fr_1fr_2fr_1fr] w-full border-b border-border">
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">IP</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Device Name</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Status</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Wake</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Connect</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Edit</div>
          </div>

          {devices.map((device) => (
            <div key={(device as Device).id} className="grid grid-cols-[2fr_4fr_1fr_1fr_2fr_1fr] w-full border-b border-border">
              <div className="px-4 py-3 font-medium text-sm bg-muted text-muted-foreground">{(device as Device).ip}</div>
              <div className="px-4 py-3 font-medium text-sm bg-muted text-muted-foreground text-wrap">{(device as Device).name}</div>
              <div className="px-4 py-3 font-medium text-sm bg-muted text-muted-foreground">{(device as Device).status ? "Online" : "Offline"}</div>
              <div
                className="px-4 py-3 font-medium text-sm bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => handleWake(device as Device)}
              >
                Wake
              </div>
              <div className="px-4 py-3 font-medium text-sm bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80" onClick={() => handleConnect((device as Device))}>
                <Monitor className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 font-medium text-sm bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80" onClick={() => handleEditClick(device as Device)}>
                <Pencil className="w-5 h-5" />
              </div>
            </div>
          ))}

          <div className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Monitor className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">No devices connected</h3>
                <p className="text-muted-foreground">
                  Add your first device to start remote management
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddDeviceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <EditDeviceModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        device={selectedDevice as Device}
        onDeviceUpdated={handleDeviceUpdated}
      />
    </div>
  );
}