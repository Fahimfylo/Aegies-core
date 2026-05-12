"use client";

import Navbar from "@/components/navigation/Navbar";
import { Shield, Search, History, AlertTriangle, CheckCircle, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', scans: 45, threats: 2 },
  { name: 'Tue', scans: 52, threats: 5 },
  { name: 'Wed', scans: 38, threats: 1 },
  { name: 'Thu', scans: 65, threats: 12 },
  { name: 'Fri', scans: 48, threats: 3 },
  { name: 'Sat', scans: 24, threats: 0 },
  { name: 'Sun', scans: 31, threats: 1 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0C16]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-28 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold">Security Overview</h1>
            <p className="text-muted-foreground">Welcome back, Agent. System status: <span className="text-green-500 font-medium">Optimal</span></p>
          </div>
          <div className="flex gap-3">
            <Link href="/scanner/file">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm">
                <Search className="w-4 h-4" /> New File Scan
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Files Scanned", value: "1,284", icon: Shield, trend: "+12%", color: "text-primary" },
            { label: "Threats Blocked", value: "43", icon: AlertTriangle, trend: "+5%", color: "text-destructive" },
            { label: "Safe Domains", value: "892", icon: CheckCircle, trend: "+8%", color: "text-green-500" },
            { label: "Risk Score Index", value: "14/100", icon: Activity, trend: "-2%", color: "text-accent" },
          ].map((stat, i) => (
            <Card key={i} className="glass-dark border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-primary'}`}>
                    {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-headline">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Lists */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-dark border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Threat Activity Timeline</CardTitle>
              <CardDescription>Daily scanning volume vs. detected threats</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" stroke="#ffffff30" fontSize={12} />
                  <YAxis stroke="#ffffff30" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0C16', borderColor: '#ffffff10' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#3B82F6" fillOpacity={1} fill="url(#colorScans)" />
                  <Area type="monotone" dataKey="threats" stroke="#8B5CF6" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-lg">System Health</CardTitle>
              <CardDescription>Real-time defensive posture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Database Sync</span>
                  <span className="text-green-500 font-medium">Synced</span>
                </div>
                <Progress value={100} className="h-1 bg-white/5" indicatorClassName="bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Heuristic Accuracy</span>
                  <span className="text-primary font-medium">98.4%</span>
                </div>
                <Progress value={98} className="h-1 bg-white/5" indicatorClassName="bg-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className="text-accent font-medium">24%</span>
                </div>
                <Progress value={24} className="h-1 bg-white/5" indicatorClassName="bg-accent" />
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Recent Alerts</h4>
                <div className="space-y-4">
                  {[
                    { type: 'File Blocked', target: 'invoice.pdf.exe', time: '2m ago' },
                    { type: 'Phishing Detected', target: 'login-secure.xyz', time: '15m ago' },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{alert.type}</p>
                        <p className="text-xs text-muted-foreground truncate">{alert.target}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
