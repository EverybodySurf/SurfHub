import { redirect } from 'next/navigation';

export default function CurateRedirect() {
  redirect('/admin/content');
}
