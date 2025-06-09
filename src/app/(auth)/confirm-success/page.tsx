// src/app/auth/confirm-success/page.tsx

import Link from 'next/link';

export default function ConfirmSuccessPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Email Successfully Verified!</h1>
        <p className="text-muted-foreground mb-6">
          Your email address has been confirmed. You can now access your dashboard and private features.
        </p>
        <Link href="/private" className="text-blue-500 hover:underline">
          Go to your Dashboard
        </Link>
      </div>
    </div>
  );
}