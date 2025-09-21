import React from 'react'
import Link from 'next/link'

const links = [
  {
    href: "/pricing",
    title: "Pricing"
  },
  {
    href: "/template",
    title: "Template"
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

const Navbar = () => {
  return (
    <div className='inline-flex justify-center items-center gap-[30px] relative w-[369px] h-[46px] px-[28px] py-[15px] shrink-1 rounded-full bg-white shadow-[0_0_0_1px_#EAE7E4]'>
      {links.map((link, index) => (
        <Link href={link.href} key={index} className="text-[#4D4946] font-inter text-sm font-[460] leading-[18px] hover:text-neutral-500 transition duration-200">
          {link.title}
        </Link>
      ))}
    </div>
  )
}

export default Navbar