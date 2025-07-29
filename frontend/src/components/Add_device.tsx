'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddDeviceButtonProps {
    onClick: () => void;
}

export default function AddDeviceButton({ onClick }: AddDeviceButtonProps) {
    return (
        <Button
            onClick={onClick}
            className="flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
        </Button>
    );
}