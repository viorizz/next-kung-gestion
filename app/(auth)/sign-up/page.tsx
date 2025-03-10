// app/(auth)/sign-up/page.tsx
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md p-8 space-y-4">
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-bold">
          Kung Gestion
        </Link>
        <h1 className="text-xl font-semibold mt-2">Create a new account</h1>
      </div>
      
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "shadow-none",
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  );
}