'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function fetchProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    // Depending on how you want to handle this, you might redirect or return null/error
    return null;
  }

  return data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const name = formData.get('name') as string;
  // Attempt to update the profile
  // Use count property to check how many rows were updated
  const { count: updatedCount, error: updateError } = await supabase
    .from('profiles')
    .update({ name: name })
    .eq('id', user.id)
    .count('exact'); // Request the count of updated rows

  if (updateError) {
    console.error('Error attempting to update profile:', updateError);
    // Handle update error appropriately
  }

  // If updateError is null and no rows were updated, insert a new profile
  if (!updateError && (updatedCount === null || updatedCount === 0)) {
    const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, name: name });
    if (insertError) {
      console.error('Error inserting new profile:', insertError);
      // Handle error appropriately
    }
  }
  revalidatePath('/private');
  redirect('/private'); // Redirect back to the private page after update
}