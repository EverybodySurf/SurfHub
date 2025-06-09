'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/private')
}

export async function socialLogin(provider: 'google' | 'github' | 'facebook' | 'apple') {
  const supabase = await createClient();
  let redirectToUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/confirm`
    : 'http://localhost:3000/auth/confirm';
  
  let data, error;

  switch (provider) {
    case 'google':
      ({ data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectToUrl },
      }));
      break;
    case 'github':
       ({ data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: redirectToUrl },
      }));
      break;
    case 'facebook':
      // TODO: Add Facebook social login logic here
      break;
    case 'apple':
      // TODO: Add Apple social login logic here
      break;
    default:
      console.error('Unsupported social login provider:', provider);
      redirect('/error');
  }

  if (error) {
    console.error(`Error signing in with ${provider}:`, error);
    redirect('/error');
  }
  if (data?.url) {
    redirect(data.url);
  }
}


export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/auth/confirm')
}