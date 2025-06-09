import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Keep this for server-side user fetching initially
import { fetchProfile } from './actions' // Import the actions
import ProfileForm from '@/components/private/ProfileForm'; // Import the ProfileForm Client Component

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const profile = await fetchProfile(); // Fetch profile data on the server

  return (
    // Render the ProfileForm Client Component here and pass props
    <ProfileForm user={user} profile={profile} />
  )
}
