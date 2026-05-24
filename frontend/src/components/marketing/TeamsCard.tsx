'use client'
import React, { useState } from 'react';
import { Users, MessageSquare, CheckCircle2, Clock, Zap} from 'lucide-react';

const TeamCollaborationCard = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('activity');

  const teamMembers = [
    { id: 1, name: 'Sarah Chen', role: 'Content Lead', avatar: 'SC', avatarUrl: 'https://i.pravatar.cc/100?img=32', color: 'from-[#FF9B4F] to-[#FF6E00]', status: 'online' },
    { id: 2, name: 'Mike Johnson', role: 'Designer', avatar: 'MJ', avatarUrl: 'https://i.pravatar.cc/100?img=12', color: 'from-[#FFB67D] to-[#FF9B4F]', status: 'online' },
    { id: 3, name: 'Emma Davis', role: 'Strategist', avatar: 'ED', avatarUrl: 'https://i.pravatar.cc/100?img=47', color: 'from-[#FF6E00] to-[#FFB57C]', status: 'away' },
    { id: 4, name: 'Alex Kim', role: 'Copywriter', avatar: 'AK', avatarUrl: 'https://i.pravatar.cc/100?img=15', color: 'from-[#FFD4B2] to-[#FFB67D]', status: 'online' },
  ];

  const activities = [
    { id: 1, user: 'Sarah Chen', action: 'approved post', post: 'Summer Campaign Launch', time: '2m ago', type: 'approve' },
    { id: 2, user: 'Mike Johnson', action: 'added comment on', post: 'Product Announcement', time: '5m ago', type: 'comment' },
    { id: 3, user: 'Emma Davis', action: 'scheduled', post: 'Weekly Newsletter', time: '12m ago', type: 'schedule' },
  ];

  return (
    <div className="relative w-[380px] h-[420px] rounded-[18px] pt-5 px-5 pb-5 overflow-hidden group bg-white shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#FF9B4F]/20 border border-[#FFD4B2]">
      <div className="relative z-10 flex flex-col items-center h-full pb-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FF6E00] flex items-center justify-center shadow-[0_4px_12px_rgba(255,155,79,0.3)] transition-all duration-300 group-hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] group-hover:scale-105">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#181817] text-base font-bold">Team Workspace</h3>
              <p className="text-[#4D4946]/60 text-xs">4 members active</p>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 w-full">
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
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${member.color} p-0.5 shadow-lg transition-all duration-300 ${hoveredMember === member.id ? 'scale-110 shadow-xl' : ''}`}>
                  <img
                    src={member.avatarUrl}
                    alt={`${member.name} headshot`}
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
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
        <div className="flex gap-2 mb-3 w-full">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeTab === 'activity'
                ? 'text-white'
                : 'bg-[#F3EFEC] text-[#4D4946] hover:bg-[#EAE7E4]'
            }`}
            style={
              activeTab === 'activity'
                ? {
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
                    boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
                    textShadow: '0 0.8px 0.7px #D96F1D'
                  }
                : undefined
            }
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeTab === 'tasks'
                ? 'text-white'
                : 'bg-[#F3EFEC] text-[#4D4946] hover:bg-[#EAE7E4]'
            }`}
            style={
              activeTab === 'tasks'
                ? {
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
                    boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
                    textShadow: '0 0.8px 0.7px #D96F1D'
                  }
                : undefined
            }
          >
            Tasks
          </button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto custom-scrollbar w-full">
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
        <div className="flex items-center gap-2 w-full mt-auto">
          <button
            className="flex-1 h-10 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 group/btn"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
              boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
              textShadow: '0 0.8px 0.7px #D96F1D'
            }}
          >
            <Zap className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:scale-110" />
            <span>Invite Members</span>
          </button>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 group/icon"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
              boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
              textShadow: '0 0.8px 0.7px #D96F1D'
            }}
          >
            <MessageSquare className="w-4 h-4 text-white transition-all duration-300 group-hover/icon:scale-110" />
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