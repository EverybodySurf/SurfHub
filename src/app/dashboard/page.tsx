'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import data from "./data.json"
import { RealtimeChat } from "@/components/realtime-chat"
import AccountForm from "@/app/account/account-form"

function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [user, setUser] = useState<User | null>(null)
  const username =
  user?.user_metadata?.full_name ||
  user?.email ||
  'Anonymous'
  console.log("tab:", tab);
  


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/signin')
      } else {
        setLoading(false)
        
      }
    })
  }, [router, supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div>Current tab: {tab}</div>
              {tab === "dashboard" && (
                <div className="px-4 lg:px-6">
                  <SectionCards />
                </div>
              )}
              {tab === "surf-reports" && (
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
              )}
              {tab === "marketplace" && (
                <div className="px-4 lg:px-6">
                  {/* <ProfileComponent user={user} /> <--inserted here */}
                </div>
              )}
              {tab === "directory-tools" && (
                <div className="px-4 lg:px-6">
                  {/* <ProfileComponent user={user} /> <--inserted here */}
                </div>
              )}
              {tab === "forum-activity" && (
                <div className="px-4 lg:px-6">
                  {/* <ProfileComponent user={user} /> <--inserted here */}
                </div>
              )}
              {tab === "analytics" && (
                <div className="px-4 lg:px-6">
                  {/* <ProfileComponent user={user} /> <--inserted here */}
                </div>
              )}
              {tab === "direct-messaging" && user && (
                <div className="px-4 lg:px-6">
                  <RealtimeChat 
                    roomName="my-chat-room" username={username} />
                </div>
              )}
              {tab === "events" && (
                <div className="px-4 lg:px-6">
                  {/* <ProfileComponent user={user} /> <--inserted here */}
                </div>
              )}
              {tab === "profile" && (
                <div className="px-4 lg:px-6">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">My Profile</h2>
                    <AccountForm mode="edit" />
                  </div>
                </div>
              )}
              {/* Default dashboard content if no tab is set */}
              {!tab && (
                <>
                  <div className="px-4 lg:px-6">
                  <SectionCards />
                </div>
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <div className="px-4 lg:px-6">
                  <DataTable data={data} />
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
