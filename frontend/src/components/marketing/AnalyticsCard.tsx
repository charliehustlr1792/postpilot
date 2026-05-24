import React from 'react';

const AnalyticsCard = () => {
  return (
    <div className="group relative flex w-80 flex-col rounded-xl bg-white p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#FF9B4F]/20 border border-[#FFD4B2]">
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6E00] shadow-[0_1px_0_0_#FFA76A_inset,0_1px_3px_-1px_#A84D09]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#181817]">Performance Analytics</h3>
          </div>

        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#F3EFEC]/50 p-3">
            <p className="text-xs font-medium text-[#4D4946]">Total Views</p>
            <p className="text-lg font-semibold text-[#181817]">24.5K</p>
            <span className="text-xs font-medium text-[#FF9B4F]">+12.3%</span>
          </div>

          <div className="rounded-lg bg-[#F3EFEC]/50 p-3">
            <p className="text-xs font-medium text-[#4D4946]">Conversions</p>
            <p className="text-lg font-semibold text-[#181817]">1.2K</p>
            <span className="text-xs font-medium text-[#FF9B4F]">+8.1%</span>
          </div>
        </div>

        <div className="mb-4 h-24 w-full overflow-hidden rounded-lg bg-[#F3EFEC]/50 p-3">
          <div className="flex h-full w-full items-end justify-between gap-1">
            <div className="h-[40%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[60%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
            <div className="h-[60%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[40%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
            <div className="h-[75%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[80%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
            <div className="h-[45%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[50%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
            <div className="h-[85%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[90%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
            <div className="h-[65%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[70%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
            <div className="h-[95%] w-3 rounded-sm bg-[#FF9B4F]/30">
              <div className="h-[85%] w-full rounded-sm bg-[#FF9B4F] transition-all duration-300"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#4D4946]">Last 7 days</span>
            <svg className="h-4 w-4 text-[#4D4946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          <button
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
              boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
              textShadow: '0 0.8px 0.7px #D96F1D'
            }}
          >
            View Details
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;