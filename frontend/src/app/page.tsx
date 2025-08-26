'use client'

import Devices from "../components/Devices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center py-4">
          <div></div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <div className="text-center space-y-4 py-4">
          <h1 className="text-4xl font-bold text-foreground">
            Remote Control Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage and control your devices remotely with our advanced monitoring system
          </p>
        </div>
        <Card className="border-border shadow-lg bg-card h-[calc(100vh-20rem)]">
          <CardContent className="p-6">
            <Devices />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
