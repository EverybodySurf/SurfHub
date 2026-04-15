'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import data from "./data.json"

// Lazy-load heavy components to reduce initial bundle
const ChartAreaInteractive = dynamic(
  () => import("@/components/chart-area-interactive").then(mod => ({ default: mod.ChartAreaInteractive })),
  { 
    loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg" />,
    ssr: false 
  }
)

const DataTable = dynamic(
  () => import("@/components/data-table").then(mod => ({ default: mod.DataTable })),
  { 
    loading: () => <div className="h-[400px] animate-pulse bg-muted rounded-lg" />,
    ssr: false 
  }
)

const RealtimeChat = dynamic(
  () => import("@/components/realtime-chat").then(mod => ({ default: mod.RealtimeChat })),
  { 
    loading: () => <div className="h-[400px] animate-pulse bg-muted rounded-lg" />,
    ssr: false 
  }
)

const AccountForm = dynamic(
  () => import("@/app/account/account-form"),
  { 
    loading: () => <div className="h-[400px] animate-pulse bg-muted rounded-lg" />,
    ssr: false 
  }
)

function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const [user, setUser] = useState<User | null>(null)
  const username =
    user?.user_metadata?.full_name ||
    user?.email ||
    'Anonymous'

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
