// app/(auth)/sign-in/page.tsx
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="w-full max-w-md p-8 space-y-4">
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-bold">
          Kung Gestion
        </Link>
        <h1 className="text-xl font-semibold mt-2">Sign in to your account</h1>
      </div>
      
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "shadow-none",
          }
        }}
        redirectUrl="/dashboard"
      />
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}