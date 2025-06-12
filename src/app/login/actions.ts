'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basic validation
  if (!email || !isValidEmail(email) || !password || password.length < 6) {
    redirect('/error?reason=invalid-input')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
  // Redirect to the account page after successful login
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basic validation
  if (!email || !isValidEmail(email) || !password || password.length < 6) {
    redirect('/error?reason=invalid-input')
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/error?reason=auth-failed')
  }

  revalidatePath('/', 'layout')
  redirect('/auth/confirm-request')
}


export async function socialLogin(formData: FormData) {
  const provider = formData.get('provider') as 'google' | 'github' | 'facebook' | 'apple';
  const supabase = await createClient();
  let redirectToUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/confirm-prompt`
    : 'http://localhost:3000/auth/confirm-prompt';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectToUrl },
  });

  if (error) {
    console.error(`Error signing in with ${provider}:`, error);
    redirect('/error');
  }
  if (data?.url) {
    redirect(data.url);
  }
}


