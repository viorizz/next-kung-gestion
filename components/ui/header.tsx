'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = 'Kung Gestion', className = '' }: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <header
      className={`relative flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Logo placeholder */}
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-extrabold text-xl text-gray-900 shadow">
          K
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="font-semibold">
                Dashboard
              </Button>
            </Link>
            <Link href="/user-profile">
              <Button className="bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300">
                Mon Compte
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <Button variant="ghost" className="font-semibold">
                Se connecter
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300">
                S'inscrire
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}