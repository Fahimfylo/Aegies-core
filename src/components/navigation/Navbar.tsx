"use client";

import Link from "next/link";
import { Shield, LayoutDashboard, Search, History, BookOpen, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "File Scanner", href: "/scanner/file", icon: Search },
  { name: "URL Scanner", href: "/scanner/url", icon: Search },
  { name: "History", href: "/reports", icon: History },
  { name: "Threat Intel", href: "/threat-intel", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-glow">
            AEGIS<span className="text-primary">CORE</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/settings" className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
        </div>
      </div>
    </nav>
  );
}
