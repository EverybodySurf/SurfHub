import React from 'react';

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Confirm Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          Thank you for signing up! We've sent a confirmation email to your inbox.
          Please check your email and click on the confirmation link to complete your signup and access your account.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          If you don't receive the email within a few minutes, please check your spam folder.
        </p>
      </div>
    </div>
  );
}