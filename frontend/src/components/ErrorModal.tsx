'use client'

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: string;
  title?: string;
}

export default function ErrorModal({ open, onOpenChange, error, title = "Error" }: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            An error has occurred
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
          <p className="text-sm text-destructive break-words">{error}</p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}