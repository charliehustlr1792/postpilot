'use client';
import React, { useState } from 'react';
import { ImageIcon, Sparkles, Send } from 'lucide-react';

const PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    limit: 3000,
    icon: (
      <svg width="20" height="20" viewBox="0 0 76 76" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M 51.2177,50.8081L 45.478,50.8081L 45.478,41.6294C 45.478,39.3219 44.6462,37.7487 42.5706,37.7487C 40.983,37.7487 40.0402,38.8102 39.6264,39.8353C 39.4731,40.2018 39.4351,40.7136 39.4351,41.2257L 39.4351,50.8081L 33.6963,50.8081C 33.6963,50.8081 33.7715,35.261 33.6963,33.6519L 39.4351,33.6519L 39.4351,36.0839C 40.1968,34.9152 41.5585,33.2478 44.6074,33.2478C 48.385,33.2478 51.2177,35.6988 51.2177,40.9711M 27.6509,31.3081L 27.6121,31.3081C 25.6872,31.3081 24.4387,29.9912 24.4387,28.3425C 24.4387,26.6607 25.7235,25.3801 27.6872,25.3801C 29.6514,25.3801 30.8585,26.6607 30.8966,28.3425C 30.8966,29.9912 29.6514,31.3081 27.6509,31.3081 Z M 30.5208,50.8081L 24.7794,50.8081L 24.7794,33.6519L 30.5208,33.6519M 54.1939,18.9999L 21.8082,18.9999C 20.2578,18.9999 19,20.2185 19,21.7224L 19,54.2762C 19,55.7797 20.2578,56.9999 21.8082,56.9999L 54.1939,56.9999C 55.7452,56.9999 57,55.7797 57,54.2762L 57,21.7224C 57,20.2185 55.7452,18.9999 54.1939,18.9999 Z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    limit: 63206,
    icon: (
      <svg width="20" height="20" viewBox="0 0 76 76" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M 57.0001,25.3338C 57.0001,22.0059 53.9939,19.0001 50.6668,19.0001L 25.3343,19.0001C 22.0047,19.0001 19.0001,22.0059 19.0001,25.3338L 19.0001,50.6663C 19.0001,53.9943 22.0047,57.0001 25.3343,57.0001L 38,57L 38,42.9999L 33,42.9999L 33.0001,36.9998L 38.0001,36.9998L 38.0001,33.8437C 38.0001,29.5882 41.1963,25.7556 45.1272,25.7556L 50.2446,25.7556L 50.2446,32.089L 45.1272,32.089C 44.5657,32.089 44.0001,32.7307 44.0001,33.75L 44.0001,36.9998L 50.5001,36.9997L 50,42.9999L 44,42.9999L 44,57L 50.6668,57.0001C 53.9939,57.0001 57.0001,53.9943 57.0001,50.6663L 57.0001,25.3338 Z" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    limit: 280,
    icon: (
      <svg width="16" height="16" viewBox="0 0 251 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M149.078767,108.398529 L242.331303,0 L220.233437,0 L139.262272,94.1209195 L74.5908396,0 L0,0 L97.7958952,142.3275 L0,256 L22.0991185,256 L107.606755,156.605109 L175.904525,256 L250.495364,256 L149.07334,108.398529 L149.078767,108.398529 Z M118.810995,143.581438 L108.902233,129.408828 L30.0617399,16.6358981 L64.0046968,16.6358981 L127.629893,107.647252 L137.538655,121.819862 L220.243874,240.120681 L186.300917,240.120681 L118.810995,143.586865 L118.810995,143.581438 Z" />
      </svg>
    ),
  },
  {
    id: 'reddit',
    name: 'Reddit',
    limit: 40000,
    icon: (
      <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M248,104a31.99228,31.99228,0,0,0-52.9375-24.19043c-16.75439-8.90112-36.76172-14.279-57.666-15.52539l5.19581-31.17578,21.83105,3.3584a24.00409,24.00409,0,1,0,2.43506-15.814l-29.64209-4.56006a7.996,7.996,0,0,0-9.10742,6.5918l-6.91309,41.478c-21.83887.94165-42.813,6.37891-60.2583,15.647a31.99266,31.99266,0,0,0-42.59229,47.74024A59.04669,59.04669,0,0,0,16,144c0,21.93457,12.042,42.35156,33.90723,57.48926C70.875,216.00588,98.60938,224,128,224s57.125-7.99414,78.09277-22.51074C227.958,186.35158,240,165.93459,240,144a59.01726,59.01726,0,0,0-2.3457-16.44922A32.17163,32.17163,0,0,0,248,104ZM72,132a16,16,0,1,1,16,16A16.01833,16.01833,0,0,1,72,132Zm92.69629,51.10938a80.122,80.122,0,0,1-73.39209,0,8,8,0,0,1,7.34033-14.2168,64.09433,64.09433,0,0,0,58.71094,0,8.00008,8.00008,0,0,1,7.34082,14.2168ZM168,148a16,16,0,1,1,16-16A16.01833,16.01833,0,0,1,168,148Z" />
      </svg>
    ),
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    limit: 500,
    icon: (
      <svg width="18" height="18" viewBox="0 0 579.148 579.148" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M434.924,38.847C390.561,12.954,342.107,0.01,289.574,0.01c-52.54,0-100.992,12.944-145.356,38.837C99.854,64.741,64.725,99.87,38.837,144.228C12.944,188.597,0,237.049,0,289.584c0,58.568,15.955,111.732,47.883,159.486c31.922,47.768,73.771,83.08,125.558,105.949c-1.01-26.896,0.625-49.137,4.902-66.732l37.326-157.607c-6.285-12.314-9.425-27.645-9.425-45.999c0-21.365,5.404-39.217,16.212-53.538c10.802-14.333,24.003-21.5,39.59-21.5c12.564,0,22.246,4.143,29.034,12.448c6.787,8.292,10.184,18.727,10.184,31.292c0,7.797-1.451,17.289-4.334,28.47c-2.895,11.187-6.665,24.13-11.31,38.837c-4.651,14.701-7.98,26.451-9.994,35.252c-3.525,15.33-0.63,28.463,8.672,39.4c9.295,10.936,21.616,16.4,36.952,16.4c26.898,0,48.955-14.951,66.176-44.865c17.217-29.914,25.826-66.236,25.826-108.973c0-32.925-10.617-59.701-31.859-80.312c-21.242-20.606-50.846-30.918-88.795-30.918c-42.486,0-76.862,13.642-103.123,40.906c-26.267,27.277-39.401,59.896-39.401,97.84c0,22.625,6.414,41.609,19.229,56.941c4.272,5.029,5.655,10.428,4.149,16.205c-0.508,1.512-1.511,5.281-3.017,11.309c-1.505,6.029-2.515,9.934-3.017,11.689c-2.014,8.049-6.787,10.564-14.333,7.541c-19.357-8.043-34.064-21.99-44.113-41.85c-10.055-19.854-15.08-42.852-15.08-68.996c0-16.842,2.699-33.685,8.103-50.527c5.404-16.842,13.819-33.115,25.264-48.832c11.432-15.698,25.135-29.596,41.102-41.659c15.961-12.069,35.38-21.738,58.256-29.04c22.871-7.283,47.51-10.93,73.904-10.93c35.693,0,67.744,7.919,96.146,23.751c28.402,15.839,50.086,36.329,65.043,61.463c14.951,25.135,22.436,52.026,22.436,80.692c0,37.705-6.541,71.641-19.607,101.807c-13.072,30.166-31.549,53.855-55.43,71.072c-23.887,17.215-51.035,25.826-81.445,25.826c-15.336,0-29.664-3.58-42.986-10.748c-13.33-7.166-22.503-15.648-27.528-25.453c-11.31,44.486-18.097,71.018-20.361,79.555c-4.78,17.852-14.584,38.457-29.413,61.836c26.897,8.043,54.296,12.062,82.198,12.062c52.534,0,100.987-12.943,145.35-38.83c44.363-25.895,79.492-61.023,105.387-105.393c25.887-44.365,38.838-92.811,38.838-145.352c0-52.54-12.951-100.985-38.838-145.355C514.422,99.87,479.287,64.741,434.924,38.847z" />
      </svg>
    ),
  },
]

const AI_CAPTIONS = [
  "Just launched something big 🚀 Excited to share what we've been building for the past 6 months...",
  "The best time to start was yesterday. The second best time is now. Here's what I'm working on →",
  "Behind every great product is an even greater team. Grateful for mine 🙌 #BuildInPublic",
]

const CIRCUMFERENCE = 2 * Math.PI * 14

const CharRing = ({ count, limit }: { count: number; limit: number }) => {
  const pct = Math.min(count / limit, 1)
  const offset = CIRCUMFERENCE * (1 - pct)
  const isWarning = pct > 0.8
  const isDanger = pct > 0.95
  const strokeColor = isDanger ? '#ef4444' : isWarning ? '#f97316' : '#FF9B4F'
  const remaining = limit - count

  return (
    <div className="flex items-center gap-1.5" aria-label={`${remaining} characters remaining`}>
      <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="none" stroke="#EAE7E4" strokeWidth="2.5" />
        <circle
          cx="16" cy="16" r="14"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.2s ease, stroke 0.2s ease' }}
        />
      </svg>
      {isWarning && (
        <span className={`text-[10px] font-semibold tabular-nums ${isDanger ? 'text-red-500' : 'text-orange-500'}`}>
          {remaining}
        </span>
      )}
    </div>
  )
}

const CreatePostCard = () => {
  const [content, setContent] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(['linkedin', 'twitter']))
  const [showAI, setShowAI] = useState(false)

  const togglePlatform = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size === 1) return prev
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const activeLimit = Math.min(
    ...PLATFORMS.filter(p => selected.has(p.id)).map(p => p.limit)
  )

  const applyCaption = (caption: string) => {
    setContent(caption.slice(0, activeLimit))
    setShowAI(false)
  }

  return (
    <div className="w-[370px] rounded-[20px] p-5 flex flex-col gap-3 bg-white shadow-2xl border border-[#FFD4B2] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,155,79,0.18)]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: '#FF6E00',
              boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B'
            }}
          >
            <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-[#181817] text-base font-bold">New Post</h3>
        </div>
      </div>

      {/* Platform Toggles */}
      <div>
        <p className="text-[10px] text-[#4D4946]/60 font-medium uppercase tracking-wider mb-1">Publish to</p>
        <div className="flex items-center gap-2">
          {PLATFORMS.map(p => {
            const isActive = selected.has(p.id)
            const isLinkedIn = p.id === 'linkedin'
            const isFacebook = p.id === 'facebook'
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Remove' : 'Add'} ${p.name}`}
                title={p.name}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#181817] text-white border-[#181817] shadow-sm scale-105'
                    : 'bg-white text-[#4D4946] border-[#EAE7E4] hover:border-[#FF9B4F] hover:text-[#FF6E00]'
                }`}
                style={isLinkedIn || isFacebook ? { padding: '0' } : undefined}
              >
                {p.icon}
              </button>
            )
          })}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative rounded-xl border border-[#EAE7E4] bg-[#FAFAF8] focus-within:border-[#FF9B4F] focus-within:bg-white transition-all duration-200 overflow-hidden">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, activeLimit))}
          placeholder="What do you want to share today?"
          rows={3}
          aria-label="Post content"
          className="w-full resize-none bg-transparent px-4 pt-3 pb-8 text-sm text-[#181817] placeholder:text-[#4D4946]/40 focus:outline-none leading-relaxed"
        />

        {/* Textarea footer row */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2">
          <button
            onClick={() => setShowAI(v => !v)}
            aria-expanded={showAI}
            aria-label="Get AI caption suggestions"
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 ${
              showAI
                ? 'bg-[#FF9B4F]/15 text-[#FF6E00] border-[#FF9B4F]/40'
                : 'text-[#4D4946]/60 border-[#EAE7E4] hover:text-[#FF6E00] hover:border-[#FF9B4F]/40 hover:bg-[#FF9B4F]/8'
            }`}
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            AI suggest
          </button>
          <CharRing count={content.length} limit={activeLimit} />
        </div>
      </div>

      {/* AI Suggestions Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${showAI ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!showAI}
      >
        <div className="rounded-xl border border-[#FF9B4F]/25 bg-gradient-to-b from-[#FFF8F3] to-white overflow-hidden">
          <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-[#FF9B4F]/15">
            <Sparkles className="w-3 h-3 text-[#FF9B4F]" aria-hidden="true" />
            <span className="text-[10px] font-bold text-[#FF6E00] uppercase tracking-wider">AI Suggestions</span>
          </div>
          {AI_CAPTIONS.map((caption, i) => (
            <button
              key={i}
              onClick={() => applyCaption(caption)}
              className="w-full text-left px-3.5 py-2.5 text-xs text-[#4D4946] hover:bg-[#FF9B4F]/8 hover:text-[#181817] transition-colors border-b border-[#EAE7E4]/60 last:border-0 leading-relaxed"
            >
              {caption.length > 75 ? caption.slice(0, 75) + '…' : caption}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Add image"
            className="w-8 h-8 rounded-lg border border-[#EAE7E4] bg-white flex items-center justify-center hover:bg-[#F3EFEC] hover:border-[#FF9B4F] transition-all group"
          >
            <ImageIcon className="w-6 h-6 text-[#4D4946] group-hover:text-[#FF9B4F] transition-colors" aria-hidden="true" />
          </button>
        </div>

        <button
          className="flex items-center h-9 px-4 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_4px_16px_rgba(255,110,0,0.4)] hover:-translate-y-px active:translate-y-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.16) 100%), #FF6E00',
            boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
            textShadow: '0 0.8px 0.7px #D96F1D',
          }}
        >
          Schedule
        </button>
      </div>
    </div>
  )
}

export default CreatePostCard;
