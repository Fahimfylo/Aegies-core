
"use client";

import { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { User, Shield, Bell, Lock, Database, Globe, Save, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuration Updated",
        description: "Your security preferences have been synchronized with the AegisCore cloud.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0C16]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-12">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Manage your agent profile and defensive telemetry configurations.</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <Card className="glass-dark border-white/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Agent Profile</CardTitle>
                <CardDescription>Update your tactical information and identifiers.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Display Name</Label>
                  <Input id="agent-name" placeholder="Agent Smith" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-id">Tactical ID</Label>
                  <Input id="agent-id" value="AC-9920-X" readOnly className="bg-white/5 border-white/10 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Encrypted Communication Email</Label>
                <Input id="email" type="email" placeholder="agent@aegiscore.def" className="bg-white/5 border-white/10" />
              </div>
            </CardContent>
          </Card>

          {/* Defense Configuration */}
          <Card className="glass-dark border-white/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Defense Engine</CardTitle>
                <CardDescription>Configure AI sensitivity and heuristic thresholds.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aggressive Heuristics</Label>
                  <p className="text-xs text-muted-foreground">Enable deep binary analysis for non-standard MIME types.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>GenAI Threat Labeling</Label>
                  <p className="text-xs text-muted-foreground">Automatically categorize detected threats using LLM insights.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Scanning Depth</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light (Fast)</SelectItem>
                    <SelectItem value="medium">Standard (Recommended)</SelectItem>
                    <SelectItem value="deep">Deep (Hardware Intensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-dark border-white/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Alert Routing</CardTitle>
                <CardDescription>Manage how critical threat notifications are delivered.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>High-Risk Desktop Alerts</Label>
                  <p className="text-xs text-muted-foreground">Show immediate notification for Critical risk detections.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Intelligence Report</Label>
                  <p className="text-xs text-muted-foreground">Email the GSOC Daily Briefing every morning.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Dangerous Zone */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Lock className="w-5 h-5" /> Critical Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Purge Local Scan Cache</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all temporary local scan artifacts.</p>
                </div>
                <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">Purge Data</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-12">
            <Button variant="ghost" className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 min-w-[120px]">
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
