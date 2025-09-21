import React from 'react'
import Image from 'next/image'

const Logo = () => {
    return (
        <div className='flex gap-[5px] items-center'>
            <Image
                src="/assets/logo.png"
                alt="Logo"
                width={42}
                height={42}
                className='rounded-full object-cover flex-shrink-0'
            />
            <span className="text-[#181817] font-inter text-2xl font-semibold leading-[21px]">
                PostPilot
            </span>
        </div>
    )
}

export default Logo