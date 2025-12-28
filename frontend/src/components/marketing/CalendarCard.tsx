"use client"

import React from 'react';
import { Calendar } from '@/components/ui/calendar';

const CalendarCard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="group relative flex w-80 flex-col rounded-xl bg-white p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#FF9B4F]/20 border border-[#FFD4B2]">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF9B4F] via-[#FFD4B2] to-[#FFB67D] opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30"></div>
      <div className="absolute inset-px rounded-[11px] bg-white"></div>

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF9B4F] to-[#FFD4B2]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#181817]">Post Scheduler</h3>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-[#FF9B4F]/10 px-2 py-1 text-xs font-medium text-[#FF9B4F]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF9B4F]"></span>
            Active
          </span>
        </div>

        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0 bg-transparent text-[#181817]"
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#4D4946]">Selected Date</span>
          </div>

          <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#FF9B4F] to-[#FFD4B2] px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-[#FF9B4F] hover:to-[#FFB67D]">
            Schedule Post
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;