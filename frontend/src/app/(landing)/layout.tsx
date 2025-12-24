import Logo from '@/components/Logo'
import Navbar from '@/components/Navbar'
import MobileSidebar from '@/components/MobileSidebar'
import React from 'react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='flex flex-col min-h-screen w-full'>
      <div className='fixed left-0 right-0 top-0 flex w-full h-[90px] px-[70px] lg:px-[70px] md:px-8 sm:px-4 py-0 bg-[#F3EFEC] items-center justify-between z-30'>
        <Logo/>
        <div className="hidden md:block">
          <Navbar/>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button text='Log In' className='w-[81px] h-9'/>
          </Link>
          <MobileSidebar/>
        </div>
      </div>
      {children}
    </div>
  )
}

export default layout
