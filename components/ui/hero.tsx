'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative w-full py-16 md:py-28 lg:py-36 overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,30,30,0.85),rgba(255,193,7,0.15)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')",
        }}
        aria-hidden="true"
      />
      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-lg">
              Gestion centralisée des commandes de <span className="text-yellow-400">construction</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-100 md:text-2xl font-medium drop-shadow">
              Kung Gestion simplifie la gestion des commandes spéciales pour les ingénieurs civils et les dessinateurs en centralisant tous les fabricants suisses en un seul endroit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {isSignedIn ? (
              <Button asChild size="lg" className="bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 shadow-lg">
                <Link href="/dashboard">
                  Accéder au Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 shadow-lg">
                  <Link href="/sign-up">
                    Commencer gratuitement
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-yellow-400 text-yellow-400 hover:bg-yellow-50 hover:text-gray-900">
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