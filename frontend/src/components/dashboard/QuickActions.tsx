'use client';

import React from 'react';
import { Plus, BarChart3, Users, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

const QuickActions = () => {
  const actions = [
    {
      id: 'create',
      label: 'Create Post',
      description: 'Start creating your next social post',
      icon: Plus,
      href: '/dashboard/posts?action=create',
      color: 'from-[#FF9B4F] to-[#FF6E00]',
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      description: 'Check your performance metrics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'calendar',
      label: 'Schedule Posts',
      description: 'Plan your content calendar',
      icon: CalendarIcon,
      href: '/dashboard/calendar',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'connect',
      label: 'Connect Account',
      description: 'Add new social media accounts',
      icon: Users,
      href: '/dashboard/settings?tab=accounts',
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#181817] text-lg font-bold">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group p-4 rounded-xl border border-[#EAE7E4] hover:border-[#FF9B4F] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#181817] font-semibold text-sm mb-1">
                {action.label}
              </h3>
              <p className="text-[#4D4946]/70 text-xs">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;