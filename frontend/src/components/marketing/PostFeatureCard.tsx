'use client';
import React, { useState } from 'react';
import { Image, Calendar, Send } from 'lucide-react';
import { InstagramIcon } from 'lucide-react';

const CreatePostCard = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('twitter');

  return (
    <div className="w-[380px] h-[420px] rounded-[18px] p-6 flex flex-col bg-white shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#FF9B4F]/20 border border-[#FFD4B2]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#181817] text-lg font-semibold">Create Post</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-[#F3EFEC] flex items-center justify-center hover:bg-[#EAE7E4] transition-colors">
            <svg width="64px" height="64px" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enableBackground="new 0 0 76.00 76.00" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#000000" fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" d="M 57.0001,25.3338C 57.0001,22.0059 53.9939,19.0001 50.6668,19.0001L 25.3343,19.0001C 22.0047,19.0001 19.0001,22.0059 19.0001,25.3338L 19.0001,50.6663C 19.0001,53.9943 22.0047,57.0001 25.3343,57.0001L 38,57L 38,42.9999L 33,42.9999L 33.0001,36.9998L 38.0001,36.9998L 38.0001,33.8437C 38.0001,29.5882 41.1963,25.7556 45.1272,25.7556L 50.2446,25.7556L 50.2446,32.089L 45.1272,32.089C 44.5657,32.089 44.0001,32.7307 44.0001,33.75L 44.0001,36.9998L 50.5001,36.9997L 50,42.9999L 44,42.9999L 44,57L 50.6668,57.0001C 53.9939,57.0001 57.0001,53.9943 57.0001,50.6663L 57.0001,25.3338 Z "></path> </g></svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#F3EFEC] flex items-center justify-center hover:bg-[#EAE7E4] transition-colors">
            <svg width="16px" height="16px" viewBox="0 0 251 256" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <title>X</title>
                <g>
                  <path d="M149.078767,108.398529 L242.331303,0 L220.233437,0 L139.262272,94.1209195 L74.5908396,0 L0,0 L97.7958952,142.3275 L0,256 L22.0991185,256 L107.606755,156.605109 L175.904525,256 L250.495364,256 L149.07334,108.398529 L149.078767,108.398529 Z M118.810995,143.581438 L108.902233,129.408828 L30.0617399,16.6358981 L64.0046968,16.6358981 L127.629893,107.647252 L137.538655,121.819862 L220.243874,240.120681 L186.300917,240.120681 L118.810995,143.586865 L118.810995,143.581438 Z" fill="#000000" />
                </g>
              </svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#F3EFEC] flex items-center justify-center hover:bg-[#EAE7E4] transition-colors">
              <svg width="64px" height="64px" viewBox="0 0 76.00 76.00" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enableBackground="new 0 0 76.00 76.00" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#000000" fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" d="M 39.398,36.138L 39.4351,36.0839L 39.4351,36.138M 51.2177,50.8081L 45.478,50.8081L 45.478,41.6294C 45.478,39.3219 44.6462,37.7487 42.5706,37.7487C 40.983,37.7487 40.0402,38.8102 39.6264,39.8353C 39.4731,40.2018 39.4351,40.7136 39.4351,41.2257L 39.4351,50.8081L 33.6963,50.8081C 33.6963,50.8081 33.7715,35.261 33.6963,33.6519L 39.4351,33.6519L 39.4351,36.0839C 40.1968,34.9152 41.5585,33.2478 44.6074,33.2478C 48.385,33.2478 51.2177,35.6988 51.2177,40.9711M 27.6509,31.3081L 27.6121,31.3081C 25.6872,31.3081 24.4387,29.9912 24.4387,28.3425C 24.4387,26.6607 25.7235,25.3801 27.6872,25.3801C 29.6514,25.3801 30.8585,26.6607 30.8966,28.3425C 30.8966,29.9912 29.6514,31.3081 27.6509,31.3081 Z M 30.5208,50.8081L 24.7794,50.8081L 24.7794,33.6519L 30.5208,33.6519M 54.1939,18.9999L 21.8082,18.9999C 20.2578,18.9999 19,20.2185 19,21.7224L 19,54.2762C 19,55.7797 20.2578,56.9999 21.8082,56.9999L 54.1939,56.9999C 55.7452,56.9999 57,55.7797 57,54.2762L 57,21.7224C 57,20.2185 55.7452,18.9999 54.1939,18.9999 Z "></path> </g></svg>
          </button>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="mb-4">
        <select 
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-[#EAE7E4] bg-[#F3EFEC] text-[#4D4946] text-sm font-medium focus:outline-none focus:border-[#FF9B4F] transition-colors"
        >
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      {/* Content Input */}
      <div className="flex-1 mb-4">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="resize-none w-full h-full p-4 rounded-lg border border-[#EAE7E4] bg-[#F3EFEC] text-[#181817] placeholder:text-[#4D4946]/50 text-sm focus:outline-none focus:border-[#FF9B4F] transition-colors"
          maxLength={280}
        />
        <div className="flex justify-end mt-2">
          <span className="text-xs text-[#4D4946]/60">{content.length}/280</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-lg border border-[#EAE7E4] bg-white flex items-center justify-center hover:bg-[#F3EFEC] transition-colors group">
            <Image className="w-5 h-5 text-[#4D4946] group-hover:text-[#FF9B4F] transition-colors" />
          </button>
          <button className="w-10 h-10 rounded-lg border border-[#EAE7E4] bg-white flex items-center justify-center hover:bg-[#F3EFEC] transition-colors group">
            <Calendar className="w-5 h-5 text-[#4D4946] group-hover:text-[#FF9B4F] transition-colors" />
          </button>
        </div>
        <button className="h-10 px-6 rounded-lg bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-sm font-medium flex items-center gap-2 hover:shadow-[0_4px_12px_rgba(255,110,0,0.3)] transition-all">
          <Send className="w-4 h-4" />
          Schedule
        </button>
      </div>

      {/* Preview Badge */}
      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#F3EFEC]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF9B4F]"></div>
          <span className="text-xs text-[#4D4946] font-medium">Ready to schedule</span>
        </div>
        <span className="text-xs text-[#4D4946]/60 ml-auto">Today, 2:30 PM</span>
      </div>
    </div>
  );
};

export default CreatePostCard;