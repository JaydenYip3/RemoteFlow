import Devices from "../components/Devices";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
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
