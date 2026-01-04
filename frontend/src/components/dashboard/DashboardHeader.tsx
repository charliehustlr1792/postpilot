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
    <header className="h-16 bg-[#FF6E00] bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.16)_100%)] shadow-[0_1px_0_0_#FFA76A_inset,0_1px_2px_-1px_#A84D09,0_0_0_1px_#F46F0B] sm:shadow-[0_1px_0_0_#FFA76A_inset,0_1px_3px_-1px_#A84D09,0_0_0_1px_#F46F0B]  px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-[2px]">

      <div className="flex items-center gap-3 min-w-0 ml-12 md:ml-2">
        <div className="min-w-0">
          <h1 className="text-white text-base sm:text-lg font-semibold truncate">
            {getGreeting()}, {user?.firstName || 'there'}!!
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm truncate hidden sm:block">
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