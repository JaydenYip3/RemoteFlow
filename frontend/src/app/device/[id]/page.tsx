'use client'

import React from 'react';
import { useParams } from 'next/navigation';

export default function DevicePage() {
  const params = useParams();
  const deviceId = params.id;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Device {deviceId}</h1>
      <p>Device management page for device ID: {deviceId}</p>
    </div>
  );
}