'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Calendar, BarChart3, Settings, Zap, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../Logo';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'posts', label: 'Posts', icon: FileText, href: '/dashboard/posts' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-white border border-[#EAE7E4] shadow-sm"
      >
        <Menu className="w-5 h-5 text-[#4D4946]" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EAE7E4] flex flex-col transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#EAE7E4]">
          <Logo/>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#4D4946]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#FF9B4F]/10 to-[#FF6E00]/10 text-[#FF6E00] border border-[#FFD4B2]"
                    : "text-[#4D4946] hover:bg-[#F3EFEC] hover:text-[#FF6E00]"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Upgrade Card */}
        <div className="p-4 border-t border-[#EAE7E4]">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFD4B2]/30 to-[#FF9B4F]/20 border border-[#FFD4B2]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#FF6E00]" />
              <h3 className="text-[#181817] text-sm font-bold">Upgrade to Pro</h3>
            </div>
            <p className="text-[#4D4946] text-xs mb-3">
              Unlock unlimited posts and AI features
            </p>
            <Link
              href="/pricing"
              className="block w-full text-center px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-sm font-semibold rounded-lg shadow-[0_4px_12px_rgba(255,155,79,0.3)] hover:shadow-[0_6px_16px_rgba(255,155,79,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;