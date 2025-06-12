'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/account');
    }, 3000); // Redirect after 3 seconds
    
    return () => clearTimeout(timeout); // Cleanup on unmount
  }, [router]);
    
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-2xl font-bold text-green-700">Email Verified!</h2>
        <p className="mt-2 text-sm text-gray-700">
          Your email has been successfully verified. You can now access your account.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Go to My Account
        </Link>
      </div>
    </div>
  );
}