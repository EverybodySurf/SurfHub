'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const safe = (val: string) => val === '' ? null : val;

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState('')
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [avatar_url, setAvatarUrl] = useState('')
  const [success, setSuccess] = useState('');

  // ...getProfile and updateProfile logic as before, just add about field...



const getProfile = useCallback(async () => {
  try {
    setLoading(true);
    const { data, error, status } = await supabase
      .from('profiles')
      .select('full_name, username, website, avatar_url, about')
      .eq('id', user?.id)
      .single();

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      setFullname(data.full_name || '');
      setUsername(data.username || '');
      setWebsite(data.website || '');
      setAvatarUrl(data.avatar_url || '');
      setAbout(data.about || '');
    }
  } catch (error) {
    alert('Error loading user data!');
  } finally {
    setLoading(false);
  }
}, [supabase, user]);

useEffect(() => {
  if (user) {
    getProfile();
  }
}, [user, getProfile]);

async function updateProfile({
  fullname,
  username,
  website,
  avatar_url,
  about,
}: {
  fullname: string
  username: string
  website: string
  avatar_url: string
  about: string
}) {
  try {
    setLoading(true);
    setSuccess('');
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id as string,
      full_name: safe(fullname),
      username: safe(username),
      website: safe(website),
      avatar_url: safe(avatar_url),
      about: safe(about),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    setSuccess('Profile updated!');
  } catch (error) {
    alert('Error updating the data!');
  } finally {
    setLoading(false); // <-- This ensures loading is reset
  }
}

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">My Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={e => {
              e.preventDefault()
              updateProfile({ fullname, username, website, avatar_url, about });
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Avatar
                uid={user?.id ?? null}
                url={avatar_url}
                size={100}
                onUpload={url => {
                  setAvatarUrl(url)
                  updateProfile({ fullname, username, website, avatar_url: url, about })
                }}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email ?? ''} disabled autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" value={fullname} onChange={e => setFullname(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="about">About Me</Label>
              <Input id="about" value={about} onChange={e => setAbout(e.target.value)} autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} autoComplete="url" />
            </div>
            
            {success && <div className="text-green-600 text-center">{success}</div>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}