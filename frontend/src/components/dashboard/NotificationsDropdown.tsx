'use client';

import React, { useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-[#EAE7E4] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4 border-b border-[#EAE7E4]">
        <h3 className="text-[#181817] font-semibold text-base">Notifications</h3>
      </div>

      <div className="p-8 text-center">
        <Bell className="w-12 h-12 text-[#4D4946]/30 mx-auto mb-3" />
        <p className="text-[#4D4946] text-sm">No notifications yet</p>
        <p className="text-[#4D4946]/60 text-xs mt-1">
          We&apos;ll notify you when something happens
        </p>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
