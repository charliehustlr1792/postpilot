import React from 'react'
import Link from 'next/link'

const links = [
  {
    href: "/pricing",
    title: "Features"
  },
  {
    href: "/templates",
    title: "Pricing"
  },
  {
    href: "/dashboard",
    title: "Resources"
  },
  {
    href: "/docs",
    title: "FAQ"
  }
]

const Navbar = () => {
  return (
    <div className='inline-flex h-[46px] px-[28px] py-[15px] flex-col justify-center items-center gap-[10px] rounded-full bg-white shadow-[0_0_0_1px_#EAE7E4] w-[369px]'>
      <div className='flex justify-center items-center gap-[30px] w-full'>
        {links.map((link, index) => (
          <Link href={link.href} key={index} className="flex items-center gap-1">
            <span className="text-[#4D4946] text-sm font-[460] leading-[18px] hover:text-[#FF6E00] transition" style={{fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'}}>
              {link.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Navbar
