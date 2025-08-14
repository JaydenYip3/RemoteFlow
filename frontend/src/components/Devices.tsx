'use client'

import React, {useEffect, useState } from 'react';
import AddDeviceButton from "./Add_device";
import AddDeviceModal from "./AddDeviceModal";
import EditDeviceModal from "./EditDeviceModal";
import ErrorModal from "./ErrorModal";
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Pencil } from 'lucide-react';
import Device from '@/types/device';
import { useRouter } from 'next/navigation';

export default function Devices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [errorTitle, setErrorTitle] = useState('Error');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [devices, setDevices] = useState([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const showError = (message: string, title: string = 'Error') => {
    setError(message);
    setErrorTitle(title);
    setIsErrorModalOpen(true);
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-devices`);
        if (!response.ok) {
          throw new Error(`Failed to fetch devices: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setDevices(data.devices || []);
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Failed to fetch devices. Please check your connection and try again.',
          'Device Fetch Error'
        );
        setDevices([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, [isModalOpen, isEditModalOpen, API_BASE_URL]);

  const handleWake = async (device: Device) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wake-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(device),
      });

      if (!response.ok) {
        throw new Error(`Failed to wake device: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error waking device:', error);
      showError(
        error instanceof Error ? error.message : 'Failed to wake device. Please check your connection and try again.',
        'Wake Device Error'
      );
    }
  }

  const handleConnect = async (device: Device) => {
    const response = await fetch(`${API_BASE_URL}/ping-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ip: device.ip}),
    });
    const data = await response.json();
    if (data.message) {
      router.push(`/device/${device.id}`);
    } else {
      showError(
        `Device "${device.name}" is currently offline. Please wake the device first or check its network connection.`,
        'Device Offline'
      );
    }
  }
  const handleEditClick = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Connected Devices
        </h2>
        <AddDeviceButton onClick={() => setIsModalOpen(true)} />
      </div>

      <Card className="border-border bg-card flex-1">
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_4fr_1fr_1fr_2fr_1fr] w-full border-b border-border">
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">IP</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Device Name</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Status</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Wake</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Connect</div>
            <div className="px-4 py-3 font-medium text-sm bg-muted/70 text-muted-foreground border-b-2">Edit</div>
          </div>

          {devices.length > 0 ? (
            devices.map((device) => (
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
          ))
          ) : (
            isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p">
                <Spinner show={true} size="small" />
              </div>
            ) : (
                <div className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <h3 className="text-lg font-medium text-foreground">No devices connected</h3>
                      <p className="text-muted-foreground">
                        Add your first device to start remote management
                      </p>
                    </div>
                  </div>
              )
          )}
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
      />

      <ErrorModal
        open={isErrorModalOpen}
        onOpenChange={setIsErrorModalOpen}
        error={error}
        title={errorTitle}
      />
    </div>
  );
}