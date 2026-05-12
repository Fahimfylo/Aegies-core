"use client";

import Navbar from "@/components/navigation/Navbar";
import { Search, History, Download, Trash2, ShieldAlert, CheckCircle, FileText, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const history = [
  { id: 'SCN-1029', type: 'file', target: 'invoice.pdf.exe', date: '2025-05-12 14:22', score: 92, level: 'Critical' },
  { id: 'SCN-1028', type: 'url', target: 'https://paypa1-verify.net', date: '2025-05-12 11:05', score: 85, level: 'High' },
  { id: 'SCN-1027', type: 'file', target: 'profile_pic.png', date: '2025-05-11 18:45', score: 5, level: 'Safe' },
  { id: 'SCN-1026', type: 'file', target: 'system_update.bat', date: '2025-05-11 12:20', score: 65, level: 'High' },
  { id: 'SCN-1025', type: 'url', target: 'https://github.com', date: '2025-05-10 09:12', score: 2, level: 'Safe' },
  { id: 'SCN-1024', type: 'file', target: 'manual.pdf', date: '2025-05-10 08:30', score: 10, level: 'Safe' },
];

export default function Reports() {
  return (
    <div className="min-h-screen bg-[#0A0C16]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-28 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold">Encrypted Scan Archive</h1>
            <p className="text-muted-foreground">Historical analysis reports and telemetry data.</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search scan ID..." className="pl-10 bg-white/5 border-white/10" />
          </div>
        </div>

        <Card className="glass-dark border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Date Analyzed</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.type === 'file' ? <FileText className="w-3 h-3 text-primary" /> : <Globe className="w-3 h-3 text-accent" />}
                      <span className="capitalize text-xs">{item.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{item.target}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                  <TableCell>
                    <Badge className={
                      item.level === 'Safe' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      item.level === 'High' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }>
                      {item.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-xs">{item.score}/100</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-md hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-md hover:bg-destructive/10 transition-colors group">
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 bg-white/5 border-t border-white/5 text-center">
            <button className="text-xs font-bold text-primary hover:underline">Load More Archives</button>
          </div>
        </Card>
      </main>
    </div>
  );
}
