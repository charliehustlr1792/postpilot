import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// The dashboard is private — keep every page under it out of search indexes.
// Per-route layouts override the title.
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId=await auth();

  if(!userId){
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-[#F3EFEC] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}