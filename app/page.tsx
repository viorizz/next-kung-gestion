// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center">
          <span className="text-xl font-bold">Kung Gestion</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center max-w-4xl py-16 mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Simplify Civil Engineering Orders
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl">
            Kung Gestion brings together all the order sheets of Swiss manufacturers in one place, 
            making it easier for engineers and designers to manage their project orders.
          </p>
          <div className="flex gap-4 mt-10">
            <Link href="/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center">Key Features</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="mb-3 text-xl font-semibold">Centralized Ordering</h3>
                <p className="text-gray-600">
                  Access order sheets from all Swiss manufacturers in one place, 
                  eliminating the need to navigate multiple platforms.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="mb-3 text-xl font-semibold">Product Comparison</h3>
                <p className="text-gray-600">
                  Compare similar products across different manufacturers 
                  to find the best solution for your project.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="mb-3 text-xl font-semibold">Reusable Project Data</h3>
                <p className="text-gray-600">
                  Store project information once and use it to pre-fill 
                  multiple order forms, saving time and reducing errors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Kung Gestion. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}