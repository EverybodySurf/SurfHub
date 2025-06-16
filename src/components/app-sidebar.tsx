"use client"

import * as React from "react"
import {
  BookUserIcon,
  StoreIcon,
  CircleUserIcon,
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  MessageCircleIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "SurfHub",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard?tab=dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "My Surf Reports / Forecasts",
      url: "/dashboard?tab=surf-reports",
      icon: ListIcon,
    },
    {
      title: "My Marketplace",
      url: "/dashboard?tab=marketplace",
      icon: StoreIcon,
    },
    {
      title: "Directory Tools",
      url: "/dashboard?tab=directory-tools",
      icon: BookUserIcon,
    },
    {
      title: "My Forum Activity",
      url: "/dashboard?tab=forum-activity",
      icon: UsersIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard?tab=analytics",
      icon: BarChartIcon,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard?tab=settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/dashboard?tab=help",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "/dashboard?tab=search",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Direct Messaging",
      url: "/dashboard?tab=direct-messaging",
      icon: MessageCircleIcon,
    },
    {
      name: "Events",
      url: "/dashboard?tab=events",
      icon: ClipboardListIcon,
    },
    {
      name: "My Profile",
      url: "/dashboard?tab=profile",
      icon: CircleUserIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">SurfHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
