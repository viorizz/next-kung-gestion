// components/layouts/navbar.tsx
'use client';

import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6 transition-shadow duration-200",
        scrolled ? "shadow-md" : "",
        className
      )}
    >
      <div className="flex items-center gap-2 md:w-60 lg:w-72">
        <span className="font-bold md:text-xl hidden md:block">Kung Gestion</span>
      </div>
      
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-md pl-8 bg-muted/30 focus:bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
        
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
};

export default Navbar;