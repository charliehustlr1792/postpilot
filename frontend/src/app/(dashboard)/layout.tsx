import LoginButton from '@/components/LoginButton'
import Logo from '@/components/Logo'
import Navbar from '@/components/Navbar'
import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='flex flex-col min-h-screen w-full'>
      <div className='flex w-full h-[90px] px-[70px] py-[32px] bg-[#F3EFEC] items-center justify-between gap-4 p-4'>
        <Logo/>
        <Navbar/>
        <LoginButton/>
      </div>
        {children}
    </div>
  )
}

export default layout