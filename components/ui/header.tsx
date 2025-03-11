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
    <header className={`flex items-center justify-between px-6 py-4 border-b ${className}`}>
      <div className="flex items-center">
        <span className="text-xl font-bold">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/user-profile">
              <Button>Mon Compte</Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/sign-up">
              <Button>S'inscrire</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}