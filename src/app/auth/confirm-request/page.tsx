import React from 'react';
import Link from 'next/link';

export default function ConfirmRequestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Confirm Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a confirmation email to your inbox. Please click the link in that email to verify your account and complete signup.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Didn’t get the email? Check your spam folder, or&nbsp;
          <Link href="/login" className="text-blue-500 hover:underline">return to login</Link>.
        </p>
      </div>
    </div>
  );
}