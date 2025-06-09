"use client" 

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Keep this for server-side user fetching initially
import { useEffect, useState } from 'react' // Import useState and useEffect
import { fetchProfile, updateProfile } from './actions' // Import the actions

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function PrivatePage() { // Make this a client component
  const [user, setUser] = useState<any>(null); // State to hold user data
  const [profile, setProfile] = useState<any>(null); // State to hold profile data
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    async function getUserAndProfile() {
      const supabase = await createClient(); // Still use server client for initial fetch
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect('/login');
      }
      setUser(data.user);

      const userProfile = await fetchProfile(); // Fetch profile
      setProfile(userProfile);
      setLoading(false);
    }

    getUserAndProfile();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div>Loading...</div>; // Simple loading state
  }

  if (!user) {
    return null; // Or a redirect, though useEffect should handle this
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Private Page</CardTitle>
          <CardDescription>
            Welcome, {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add form action and default value */}
          <form className="space-y-4" action={updateProfile}>
            <div>
              <Label htmlFor="name">Name</Label>
              {/* Use defaultValue to pre-fill the input */}
              <Input id="name" name="name" type="text" required defaultValue={profile?.name || ''} />
            </div>
            <Button type="submit" className="w-full">Save Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
