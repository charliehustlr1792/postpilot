'use client';

import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, ExternalLink, Bell } from 'lucide-react';
import { Notification } from '@/types/dashboard';
import { cn } from '@/lib/utils';

// Mock notifications data - replace with real data from your API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Post Published Successfully',
    message: 'Your post "Summer Campaign Launch" was published to Twitter and Instagram.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    actionUrl: '/dashboard/posts',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Scheduled Post Pending',
    message: 'Your post is scheduled for 2:00 PM today. Review before it goes live.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionUrl: '/dashboard/calendar',
  },
  {
    id: '3',
    type: 'info',
    title: 'Weekly Report Ready',
    message: 'Your analytics report for last week is now available.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: '/dashboard/analytics',
  },
  {
    id: '4',
    type: 'success',
    title: 'Account Connected',
    message: 'LinkedIn account successfully connected.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-[#EAE7E4] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#EAE7E4] flex items-center justify-between">
        <div>
          <h3 className="text-[#181817] font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-[#4D4946] text-xs mt-0.5">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          className="text-[#FF6E00] text-sm font-medium hover:text-[#FF9B4F] transition-colors"
          onClick={() => {
            // Mark all as read logic
            console.log('Mark all as read');
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-[#4D4946]/30 mx-auto mb-3" />
            <p className="text-[#4D4946] text-sm">No notifications yet</p>
            <p className="text-[#4D4946]/60 text-xs mt-1">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE7E4]">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-[#F3EFEC] transition-colors cursor-pointer group",
                  !notification.read && "bg-[#FF9B4F]/5"
                )}
                onClick={() => {
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-[#181817] font-semibold text-sm">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#FF6E00] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[#4D4946] text-xs leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#4D4946]/60 text-xs">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {notification.actionUrl && (
                        <ExternalLink className="w-3 h-3 text-[#FF6E00] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {mockNotifications.length > 0 && (
        <div className="p-3 border-t border-[#EAE7E4] bg-[#F3EFEC]">
          <button
            className="w-full text-center text-[#FF6E00] text-sm font-medium hover:text-[#FF9B4F] transition-colors"
            onClick={() => {
              window.location.href = '/dashboard/notifications';
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;