'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const links = [
  {
    href: "/pricing",
    title: "Pricing"
  },
  {
    href: "/templates",
    title: "Templates"
  },
  {
    href: "/dashboard",
    title: "Dashboard"
  },
  {
    href: "/docs",
    title: "Docs"
  }
]

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-[#4D4946]" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[#EAE7E4]">
            <span className="text-[#181817] text-lg font-semibold" style={{fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'}}>
              Menu
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-8 h-8"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[#4D4946]" />
            </button>
          </div>
          
          <nav className="flex flex-col p-4 gap-2">
            {links.map((link, index) => (
              <Link 
                href={link.href} 
                key={index} 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-[#4D4946] text-base font-[460] leading-[18px] hover:bg-[#F3EFEC] rounded-lg transition"
                style={{fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'}}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default MobileSidebar
