// app/(auth)/sign-up/verify-email-address/page.tsx
"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function VerifyEmailAddressPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const router = useRouter();

  // Handle verification code submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setVerificationError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        // Sign up is complete, set the user session to active
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        // The status may indicate that additional verification is needed
        setVerificationError("Verification failed. Please try again.");
      }
    } catch (error: any) {
      setVerificationError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification();
      // Display success message
      alert("Verification code resent. Please check your email.");
    } catch (error: any) {
      // Display error message
      alert(error.message || "Error resending verification code.");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6">
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-bold">
          Kung Gestion
        </Link>
        <h1 className="text-xl font-semibold mt-4">Verify your email</h1>
        <p className="text-gray-500 text-sm mt-2">
          We've sent a verification code to your email address.
          Please enter it below to complete your registration.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="verification-code"
            placeholder="Verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full"
            required
          />
          {verificationError && (
            <p className="text-destructive text-sm">{verificationError}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!verificationCode || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResendCode} 
            className="text-primary hover:underline font-medium"
            type="button"
          >
            Resend code
          </button>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}