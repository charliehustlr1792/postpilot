import React from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'

const Footer = () => {
    return (
        <div className='min-w-full text-black'
        style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
        boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B',
        textShadow: '0 0.8px 0.7px #D96F1D'
      }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-16 sm:py-10 flex flex-col items-start gap-6 border-b border-gray-800">
                        <Logo />
                    <p className='text-left text-sm text-gray-800 font-light max-w-md'>
                        Automate your web scraping with drag and drop workflows
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full mt-8">
                        <div className='flex flex-col space-y-3'>
                            <h1 className='text-[#181817] text-sm font-semibold tracking-wide uppercase mb-4'>Product</h1>
                            <Link href="/" className='hover:text-gray-800 transition-colors text-sm'>Pricing</Link>
                            <Link href="/" className='hover:text-gray-800 transition-colors text-sm'>Use Case</Link>
                            <Link href="/" className='hover:text-gray-800 transition-colors text-sm'>Community</Link>
                            <Link href="/" className='hover:text-gray-800 transition-colors text-sm'>Features</Link>
                        </div>
                        
                        <div className='flex flex-col space-y-3'>
                            <h1 className='text-[#181817] text-sm font-semibold tracking-wide uppercase mb-4'>Contact</h1>
                            <Link href="/" className='hover:text-gray-800 transition-colors text-sm'>Twitter</Link>
                            <Link href="/" className='hover:text-gray-800 transition-colors text-sm'>Email</Link>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-8">
                    <p className='text-gray-800 text-sm font-light whitespace-nowrap'>
                        © 2025 PostPilot. All rights reserved.
                    </p>
                    <p className="text-gray-800 text-sm font-light whitespace-nowrap">
                        Made with 🤍 by charliehustler
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Footer