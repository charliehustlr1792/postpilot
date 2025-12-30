import Image from 'next/image'
import React from 'react'

interface LogoProps {
  compact?: boolean
}

const Logo = ({ compact = false }: LogoProps) => {
  return (
    <div className="inline-flex items-center gap-2">
      <Image
        src="/assets/favicon.webp"
        alt="PostPilot Logo"
        width={26}
        height={26}
        className="object-cover"
      />

      <span
        className={`
          text-[#181817] font-semibold leading-none
          text-xl
          ${compact ? 'hidden sm:inline' : 'inline'}
        `}
        style={{
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        }}
      >
        PostPilot
      </span>
    </div>
  )
}

export default Logo