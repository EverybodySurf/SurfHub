'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/hooks/use-session'  

export default function ErrorPage() {
  return (
    <div>
      <h1>try'na see this page? Sign up then!</h1>
      <Button variant="link" className="text-blue-500 underline">
        <Link href="/login?tab=signup" className="text-blue-500 underline">
          Click here to sign up
        </Link>
      </Button>
      <p className="text-gray-500 mt-4">It's free</p>
      <p >
        or <Link href="/auth/signin" className="text-blue-500 underline">sign in</Link> if you already have an account.
      </p>
    </div>
  )
}