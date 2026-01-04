'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend: 'up' | 'down';
  };
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, subtitle }) => {
  return (
    <div className="group bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] hover:shadow-[0_8px_24px_rgba(255,155,79,0.12)] transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-[#4D4946] text-sm font-medium mb-1">{title}</p>
          <p className="text-[#181817] text-3xl font-bold">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/10 to-[#FF6E00]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-[#FF6E00]" />
        </div>
      </div>

      {/* Change Indicator or Subtitle */}
      <div className="flex items-center gap-2">
        {change ? (
          <>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              change.trend === 'up' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {change.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change.value}
            </div>
            <span className="text-[#4D4946]/60 text-xs">vs last month</span>
          </>
        ) : subtitle ? (
          <span className="text-[#4D4946]/60 text-xs">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;