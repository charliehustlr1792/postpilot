'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import NotificationsDropdown from './NotificationsDropdown';

const DashboardHeader = () => {
  const { user } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(3); // This would come from your notifications state

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 bg-white border-b border-[#EAE7E4] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Welcome Message */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[#181817] text-lg font-semibold" style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {getGreeting()}, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-[#4D4946] text-sm">
            Ready to create amazing content today?
          </p>
        </div>
      </div>

      {/* Right Section - Notifications & User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-[#F3EFEC] transition-colors"
          >
            <Bell className="w-5 h-5 text-[#4D4946]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <NotificationsDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Clerk User Button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 ring-2 ring-[#FFD4B2] ring-offset-2",
              userButtonPopoverCard: "rounded-xl border-[#EAE7E4]",
              userButtonPopoverActions: "text-[#4D4946]",
            },
          }}
        />
      </div>
    </header>
  );
};

export default DashboardHeader;