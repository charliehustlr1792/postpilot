'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar, BarChart3, Users, Zap, Settings, Home } from 'lucide-react';
import Logo from './Logo';

const links = [
  {
    href: "/",
    title: "Home",
    icon: Home
  },
  {
    href: "/features",
    title: "Features",
    icon: Zap
  },
  {
    href: "/pricing",
    title: "Pricing",
    icon: BarChart3
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Calendar
  },
  {
    href: "/Testimonials",
    title: "Testimonials",
    icon: Users
  }
];

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F3EFEC] transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-[#4D4946]" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-[0_0_40px_rgba(0,0,0,0.12)] z-50 transform transition-transform duration-300 ease-out md:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#EAE7E4]">
            <div className="flex items-center gap-3">
              <Logo/>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F3EFEC] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[#4D4946]" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-col p-6 gap-2 flex-1">
            {links.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link 
                  href={link.href} 
                  key={index} 
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 px-4 py-3 text-[#4D4946] text-base font-medium rounded-xl hover:bg-gradient-to-r hover:from-[#FF9B4F]/10 hover:to-[#FF6E00]/10 hover:text-[#FF6E00] border border-transparent hover:border-[#FFD4B2] transition-all duration-300"
                  style={{fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'}}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom CTA Section */}
          <div className="p-6 border-t border-[#EAE7E4]">
            <div className="bg-gradient-to-br from-[#FFD4B2]/30 to-[#FF9B4F]/20 rounded-xl p-4 mb-4">
              <h3 className="text-[#181817] text-sm font-bold mb-2">
                Ready to start?
              </h3>
              <p className="text-[#4D4946] text-xs mb-3">
                Schedule your first post and see the magic happen!
              </p>
              <Link 
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-sm font-semibold rounded-lg shadow-[0_4px_12px_rgba(255,155,79,0.3)] hover:shadow-[0_6px_16px_rgba(255,155,79,0.4)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>

            {/* Sign In Link */}
            <Link
              href="/sign-in"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2 text-[#4D4946] text-sm font-medium hover:text-[#FF6E00] transition-colors"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;