// app/(dashboard)/calendar/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Eye } from 'lucide-react';
import { PLATFORM_COLORS} from '@/lib/constants';
import CreatePostModal from '@/components/posts/CreatePostModal';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'scheduled' | 'published';
}

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  // Mock scheduled posts - replace with real API data
  const scheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      content: 'Just launched our new AI-powered analytics dashboard! 🚀 #tech',
      platform: 'twitter',
      date: '2025-01-15',
      time: '14:30',
      status: 'scheduled',
    },
    {
      id: '2',
      content: 'Behind the scenes of our product development process 📱',
      platform: 'instagram',
      date: '2025-01-16',
      time: '18:00',
      status: 'scheduled',
    },
    {
      id: '3',
      content: 'Excited to share our company growth story! 💼',
      platform: 'linkedin',
      date: '2025-01-16',
      time: '09:00',
      status: 'scheduled',
    },
    {
      id: '4',
      content: 'Weekend vibes! What are you working on? 🌟',
      platform: 'facebook',
      date: '2025-01-18',
      time: '16:00',
      status: 'scheduled',
    },
    {
      id: '5',
      content: 'New blog post about social media trends 📝',
      platform: 'linkedin',
      date: '2025-01-20',
      time: '12:00',
      status: 'scheduled',
    },
    {
      id: '6',
      content: 'Check out our latest product update! 🎉',
      platform: 'twitter',
      date: '2025-01-22',
      time: '15:00',
      status: 'scheduled',
    },
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

  // Generate calendar days (6 weeks)
  for (let i = 0; i < 42; i++) {
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181817]">Content Calendar</h1>
          <p className="text-[#4D4946] text-sm mt-1">
            Plan and schedule your posts across all platforms
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Schedule Post
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#4D4946]" />
            </button>
            <h2 className="text-lg font-bold text-[#181817] min-w-[200px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#4D4946]" />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-[#4D4946] hover:bg-[#F3EFEC] rounded-lg transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1 p-1 bg-[#F3EFEC] rounded-lg">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-white text-[#FF6E00] shadow-sm'
                      : 'text-[#4D4946] hover:text-[#FF6E00]'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="text-center font-semibold text-[#4D4946] text-sm py-2">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayPosts = getPostsForDate(day);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === today.toDateString();
            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
            const hasPosts = dayPosts.length > 0;

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[120px] p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isCurrentMonth ? 'border-[#EAE7E4]' : 'border-[#EAE7E4]/40 bg-[#F3EFEC]/30'
                } ${
                  isToday ? 'border-[#FF6E00] bg-[#FF9B4F]/5' : ''
                } ${
                  isSelected ? 'border-[#FF9B4F] shadow-lg scale-[1.02]' : 'hover:border-[#FFD4B2] hover:shadow-md'
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${
                    isCurrentMonth ? 'text-[#181817]' : 'text-[#4D4946]/40'
                  } ${
                    isToday ? 'w-6 h-6 flex items-center justify-center bg-[#FF6E00] text-white rounded-full' : ''
                  }`}>
                    {day.getDate()}
                  </span>
                  {hasPosts && (
                    <span className="text-xs font-medium text-[#FF6E00] bg-[#FF9B4F]/10 px-2 py-0.5 rounded-full">
                      {dayPosts.length}
                    </span>
                  )}
                </div>

                {/* Scheduled Posts */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                      className="group p-2 rounded-lg text-white text-xs font-medium truncate transition-all hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS] }}
                    >
                      <div className="flex items-center gap-1">
                        {/* <span>{PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS]}</span> */}
                        <Clock className="w-3 h-3" />
                        <span>{post.time}</span>
                      </div>
                      <p className="truncate mt-1 opacity-90 group-hover:opacity-100">
                        {post.content}
                      </p>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-[#4D4946]/60 text-center py-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details Sidebar */}
      {selectedDate && (
        <div className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-[#EAE7E4] p-6 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#181817]">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#4D4946]" />
            </button>
          </div>

          <div className="space-y-3">
            {getPostsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-[#4D4946]/30 mx-auto mb-3" />
                <p className="text-[#4D4946]/60 text-sm">No posts scheduled</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-medium rounded-lg text-sm"
                >
                  Schedule Post
                </button>
              </div>
            ) : (
              getPostsForDate(selectedDate).map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-[#EAE7E4] rounded-xl hover:border-[#FF9B4F] transition-all cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="flex items-center gap-2 px-2 py-1 rounded-lg text-white text-xs font-medium"
                      style={{ backgroundColor: PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS] }}
                    >
                      {/* <span>{PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS]}</span> */}
                      <span>{post.platform}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#4D4946]/70 text-xs">
                      <Clock className="w-3 h-3" />
                      {post.time}
                    </div>
                  </div>
                  <p className="text-[#181817] text-sm line-clamp-2">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full animate-in fade-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-medium"
                style={{ backgroundColor: PLATFORM_COLORS[selectedPost.platform as keyof typeof PLATFORM_COLORS] }}
              >
                {/* <span>{PLATFORM_ICONS[selectedPost.platform as keyof typeof PLATFORM_ICONS]}</span> */}
                <span>{selectedPost.platform}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#4D4946]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[#4D4946] text-xs font-medium mb-1">Scheduled for</p>
                <p className="text-[#181817] font-semibold">
                  {new Date(selectedPost.date + 'T' + selectedPost.time).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-[#4D4946] text-xs font-medium mb-2">Content</p>
                <p className="text-[#181817] text-sm leading-relaxed">
                  {selectedPost.content}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <button className="flex-1 px-4 py-2 bg-[#F3EFEC] text-[#4D4946] font-medium rounded-lg hover:bg-[#EAE7E4] transition-colors">
                  Edit
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-medium rounded-lg hover:shadow-lg transition-all">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(postData) => {
          console.log('Schedule post:', postData);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default CalendarPage;