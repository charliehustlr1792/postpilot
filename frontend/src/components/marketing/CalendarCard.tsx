"use client"

import React from 'react';
import { Calendar } from '@/components/ui/calendar';

const CalendarCard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="group relative flex w-80 flex-col rounded-xl bg-white p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#FF9B4F]/20 border border-[#FFD4B2]">
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6E00] shadow-[0_1px_0_0_#FFA76A_inset,0_1px_3px_-1px_#A84D09]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#181817]">Post Scheduler</h3>
          </div>

        </div>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0 bg-transparent text-[#181817] p-1"
            classNames={{
              months: "flex gap-2 flex-col md:flex-row relative",
              month: "flex flex-col w-full gap-2",
              week: "flex w-full mt-1",
              weekdays: "flex",
              month_caption: "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)"
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
              boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
              textShadow: '0 0.8px 0.7px #D96F1D'
            }}
          >
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