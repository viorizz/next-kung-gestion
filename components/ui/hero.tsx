'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Gestion centralisée des commandes de construction
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Kung Gestion simplifie la gestion des commandes spéciales pour les ingénieurs civils et les dessinateurs en centralisant tous les fabricants suisses en un seul endroit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {isSignedIn ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Accéder au Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    Commencer gratuitement
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-in">
                    Se connecter
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}