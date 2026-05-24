import React from 'react'
import { Check, X } from 'lucide-react'

const features = [
  { name: 'Multi-platform posting',       postpilot: true,       buffer: true,        hootsuite: true       },
  { name: 'Visual content calendar',      postpilot: true,       buffer: true,        hootsuite: true       },
  { name: 'AI caption suggestions',       postpilot: true,       buffer: 'Limited',   hootsuite: false      },
  { name: 'AI optimal posting times',     postpilot: true,       buffer: false,       hootsuite: false      },
  { name: 'Advanced analytics',           postpilot: true,       buffer: 'Pro only',  hootsuite: 'Pro only' },
  { name: 'Team collaboration',           postpilot: true,       buffer: true,        hootsuite: true       },
  { name: 'Content approval workflow',    postpilot: true,       buffer: false,       hootsuite: true       },
  { name: 'Free plan',                    postpilot: true,       buffer: true,        hootsuite: false      },
  { name: 'Custom branding',              postpilot: true,       buffer: false,       hootsuite: 'Enterprise' },
]

type CellValue = boolean | string

const Cell = ({ value, highlight }: { value: CellValue; highlight?: boolean }) => {
  if (value === true) {
    return (
      <span className="flex justify-center">
        <Check className="w-5 h-5 text-green-500" aria-label="Included" />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="flex justify-center">
        <X className="w-5 h-5 text-red-400" aria-label="Not included" />
      </span>
    )
  }
  return (
    <span className={`text-xs font-medium ${highlight ? 'text-white/80' : 'text-[#4D4946]'}`}>
      {value}
    </span>
  )
}

const Reason = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 sm:mt-10 mb-12 sm:mb-16 px-4 sm:px-0 overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-0 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <thead>
          <tr>
            <th scope="col" className="bg-white text-left px-5 py-4 text-xs font-semibold text-[#4D4946] uppercase tracking-wider w-[40%] border-b border-[#EAE7E4] rounded-tl-2xl">
              Feature
            </th>
            <th scope="col" className="bg-[#FF9B4F] text-center px-5 py-4 text-sm font-bold text-white border-b border-[#FF9B4F] w-[20%]">
              PostPilot
            </th>
            <th scope="col" className="bg-white text-center px-5 py-4 text-sm font-semibold text-[#4D4946] border-b border-[#EAE7E4] w-[20%]">
              Buffer
            </th>
            <th scope="col" className="bg-white text-center px-5 py-4 text-sm font-semibold text-[#4D4946] border-b border-[#EAE7E4] w-[20%] rounded-tr-2xl">
              Hootsuite
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => {
            const isLast = index === features.length - 1
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF9]'
            const borderClass = isLast ? '' : 'border-b border-[#EAE7E4]'
            return (
              <tr key={feature.name} className={rowBg}>
                <td className={`px-5 py-4 text-sm text-[#181817] font-medium ${borderClass} ${isLast ? 'rounded-bl-2xl' : ''}`}>
                  {feature.name}
                </td>
                <td className={`px-5 py-4 text-center bg-[#FF9B4F]/8 ${isLast ? '' : 'border-b border-[#FFD4B2]'}`}>
                  <Cell value={feature.postpilot} highlight />
                </td>
                <td className={`px-5 py-4 text-center ${borderClass}`}>
                  <Cell value={feature.buffer} />
                </td>
                <td className={`px-5 py-4 text-center ${borderClass} ${isLast ? 'rounded-br-2xl' : ''}`}>
                  <Cell value={feature.hootsuite} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-center text-xs text-[#4D4946]/60 mt-3">
        Comparison based on publicly available plan information as of 2025.
      </p>
    </div>
  )
}

export default Reason
