import Logo from '@/components/Logo'
import Navbar from '@/components/Navbar'
import MobileSidebar from '@/components/MobileSidebar'
import React from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <header
        className="
          fixed top-0 left-0 right-0 z-30
          flex items-center justify-between
          h-[64px] sm:h-[72px]
          px-4 sm:px-6 md:px-8 lg:px-[70px]
          bg-[#F3EFEC]
        "
      >
        <Logo compact />

        <div className="hidden md:flex">
          <Navbar />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/sign-in">
            <Button
              text="Log In"
              className="h-9 px-4 text-sm font-medium"
            />
          </Link>
          <MobileSidebar />
        </div>
      </header>

      {/* Push content below fixed header */}
      <div className="pt-[64px] sm:pt-[72px]">
        {children}
      </div>
    </div>
  )
}

export default layout
