'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { PLATFORM_COLORS } from '@/lib/constants';
import Link from 'next/link';

interface ScheduledPost {
  id: string;
  date: string; // YYYY-MM-DD format
  platform: string;
  time: string;
}

const CalendarPreview = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock scheduled posts - replace with real data
  const scheduledPosts: ScheduledPost[] = [
    { id: '1', date: '2025-01-15', platform: 'twitter', time: '14:30' },
    { id: '2', date: '2025-01-16', platform: 'instagram', time: '18:00' },
    { id: '3', date: '2025-01-16', platform: 'linkedin', time: '09:00' },
    { id: '4', date: '2025-01-18', platform: 'facebook', time: '16:00' },
    { id: '5', date: '2025-01-20', platform: 'twitter', time: '12:00' },
  ];

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  const currentDay = new Date(startDate);

  while (currentDay <= lastDay || days.length < 35) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const getPostsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledPosts.filter(post => post.date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#181817] text-lg font-bold">Upcoming Posts</h2>
        <Link
          href="/dashboard/calendar"
          className="text-[#FF6E00] text-sm font-medium hover:text-[#FF9B4F] transition-colors flex items-center gap-1 group"
        >
          View calendar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-[#4D4946]" />
        </button>
        <h3 className="text-[#181817] font-semibold text-sm">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-[#4D4946]" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-[#4D4946]/60 text-xs font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayPosts = getPostsForDate(day);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === today.toDateString();
            const hasPosts = dayPosts.length > 0;

            return (
              <div
                key={index}
                className={`
                  relative aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all duration-200
                  ${isCurrentMonth ? 'text-[#181817]' : 'text-[#4D4946]/30'}
                  ${isToday ? 'bg-[#FF9B4F] text-white font-bold' : 'hover:bg-[#F3EFEC]'}
                  ${hasPosts && !isToday ? 'font-semibold' : ''}
                `}
              >
                <span>{day.getDate()}</span>
                {hasPosts && !isToday && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayPosts.slice(0, 3).map((post, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ 
                          backgroundColor: PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS] 
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Posts List */}
      <div className="space-y-2">
        <h4 className="text-[#181817] font-semibold text-sm mb-3">Next 7 Days</h4>
        {scheduledPosts.slice(0, 3).map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between p-3 rounded-lg bg-[#F3EFEC] hover:bg-[#EAE7E4] transition-colors"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS] 
                }}
              />
              <span className="text-[#181817] text-sm font-medium">
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <span className="text-[#4D4946] text-xs">{post.time}</span>
          </div>
        ))}

        {scheduledPosts.length === 0 && (
          <div className="text-center py-6">
            <CalendarIcon className="w-10 h-10 text-[#4D4946]/30 mx-auto mb-2" />
            <p className="text-[#4D4946]/60 text-xs">No posts scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPreview;