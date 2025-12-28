'use client'
import React, { useState } from 'react';
import { Users, MessageSquare, CheckCircle2, Clock, Zap, ArrowRight } from 'lucide-react';

const TeamCollaborationCard = () => {
  const [hoveredMember, setHoveredMember] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');

  const teamMembers = [
    { id: 1, name: 'Sarah Chen', role: 'Content Lead', avatar: 'SC', color: 'from-[#FF9B4F] to-[#FF6E00]', status: 'online' },
    { id: 2, name: 'Mike Johnson', role: 'Designer', avatar: 'MJ', color: 'from-[#FFB67D] to-[#FF9B4F]', status: 'online' },
    { id: 3, name: 'Emma Davis', role: 'Strategist', avatar: 'ED', color: 'from-[#FF6E00] to-[#FFB57C]', status: 'away' },
    { id: 4, name: 'Alex Kim', role: 'Copywriter', avatar: 'AK', color: 'from-[#FFD4B2] to-[#FFB67D]', status: 'online' },
  ];

  const activities = [
    { id: 1, user: 'Sarah Chen', action: 'approved post', post: 'Summer Campaign Launch', time: '2m ago', type: 'approve' },
    { id: 2, user: 'Mike Johnson', action: 'added comment on', post: 'Product Announcement', time: '5m ago', type: 'comment' },
    { id: 3, user: 'Emma Davis', action: 'scheduled', post: 'Weekly Newsletter', time: '12m ago', type: 'schedule' },
  ];

  return (
    <div className="relative w-[380px] h-[420px] rounded-[18px] p-5 overflow-hidden group bg-white shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#FF9B4F]/20 border border-[#FFD4B2]">
      {/* Animated Background Orbs */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-[#FFD4B2]/20 to-[#FF9B4F]/10 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-50"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-[#FF9B4F]/20 to-[#FF6E00]/10 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-50"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] flex items-center justify-center shadow-[0_4px_12px_rgba(255,155,79,0.3)] transition-all duration-300 group-hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] group-hover:scale-105">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#181817] text-base font-bold">Team Workspace</h3>
              <p className="text-[#4D4946]/60 text-xs">4 members active</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F3EFEC] border border-[#EAE7E4]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9B4F] animate-pulse"></div>
            <span className="text-[10px] text-[#4D4946] font-medium">Live</span>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              className="relative flex flex-col items-center gap-1.5 p-2 rounded-lg bg-[#F3EFEC] border border-[#EAE7E4] transition-all duration-300 hover:border-[#FF9B4F] hover:shadow-[0_4px_16px_rgba(255,155,79,0.15)] hover:-translate-y-1 cursor-pointer"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="relative">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xs shadow-lg transition-all duration-300 ${hoveredMember === member.id ? 'scale-110 shadow-xl' : ''}`}>
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'} ${hoveredMember === member.id ? 'scale-125' : ''}`}></div>
              </div>
              <p className="text-[#181817] text-[10px] font-semibold truncate w-full text-center">{member.name.split(' ')[0]}</p>
              
              {/* Hover Tooltip */}
              {hoveredMember === member.id && (
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-2.5 py-1.5 bg-[#181817] rounded-lg shadow-xl z-20 whitespace-nowrap animate-fadeIn">
                  <p className="text-white text-[10px] font-medium">{member.name}</p>
                  <p className="text-white/60 text-[9px]">{member.role}</p>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#181817] rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white shadow-[0_4px_12px_rgba(255,155,79,0.3)]'
                : 'bg-[#F3EFEC] text-[#4D4946] hover:bg-[#EAE7E4]'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white shadow-[0_4px_12px_rgba(255,155,79,0.3)]'
                : 'bg-[#F3EFEC] text-[#4D4946] hover:bg-[#EAE7E4]'
            }`}
          >
            Tasks
          </button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto custom-scrollbar">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group/item flex items-start gap-2 p-2 rounded-lg bg-[#F3EFEC] border border-[#EAE7E4] transition-all duration-300 hover:border-[#FF9B4F] hover:shadow-[0_2px_8px_rgba(255,155,79,0.1)] hover:-translate-x-1 cursor-pointer"
              style={{
                animation: `slideInLeft 0.4s ease-out ${index * 0.1}s both`
              }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                activity.type === 'approve' ? 'bg-green-100 group-hover/item:bg-green-200' :
                activity.type === 'comment' ? 'bg-blue-100 group-hover/item:bg-blue-200' :
                'bg-orange-100 group-hover/item:bg-orange-200'
              }`}>
                {activity.type === 'approve' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                {activity.type === 'comment' && <MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                {activity.type === 'schedule' && <Clock className="w-3.5 h-3.5 text-orange-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#181817] text-[11px] leading-tight">
                  <span className="font-semibold">{activity.user}</span>
                  <span className="text-[#4D4946]/80"> {activity.action} </span>
                  <span className="font-medium text-[#FF6E00]">{activity.post}</span>
                </p>
                <p className="text-[#4D4946]/60 text-[10px] mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          <button className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(255,155,79,0.3)] transition-all duration-300 hover:shadow-[0_6px_24px_rgba(255,155,79,0.4)] hover:-translate-y-0.5 group/btn">
            <Zap className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:scale-110" />
            <span>Invite Members</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-[#F3EFEC] border border-[#EAE7E4] flex items-center justify-center transition-all duration-300 hover:border-[#FF9B4F] hover:bg-white hover:shadow-[0_4px_12px_rgba(255,155,79,0.15)] group/icon">
            <MessageSquare className="w-4 h-4 text-[#4D4946] transition-all duration-300 group-hover/icon:text-[#FF9B4F] group-hover/icon:scale-110" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3EFEC;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FF9B4F;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #FF6E00;
        }
      `}</style>
    </div>
  );
};

export default TeamCollaborationCard;