'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardStats } from "@/components/dashboard-stats"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
        <div className="flex flex-1 flex-col @container/main pt-16">
          <div className="flex flex-col gap-6 px-6 py-6">
            {/* Dashboard header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {username}
              </p>
            </div>

            {/* Tab content */}
            {(!tab || tab === "dashboard") && (
              <DashboardStats />
            )}
            {tab === "surf-reports" && (
              <ChartAreaInteractive />
            )}
            {tab === "marketplace" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Marketplace — coming in a future update
              </div>
            )}
            {tab === "directory-tools" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Directory Tools — coming in a future update
              </div>
            )}
            {tab === "forum-activity" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Forum Activity — coming in a future update
              </div>
            )}
            {tab === "analytics" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Analytics — coming in a future update
              </div>
            )}
            {tab === "direct-messaging" && user && (
              <RealtimeChat roomName="my-chat-room" username={username} />
            )}
            {tab === "events" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Events — coming in a future update
              </div>
            )}
            {tab === "profile" && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">My Profile</h2>
                <AccountForm mode="edit" />
              </div>
            )}
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
