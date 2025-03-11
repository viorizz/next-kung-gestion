// components/layouts/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Factory, 
  Briefcase, 
  Building2, 
  Package, 
  LineChart, 
  Settings, 
  Menu, 
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: 'Companies',
      href: '/company',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      name: 'Manufacturers',
      href: '/manufacturers',
      icon: <Factory className="w-5 h-5" />,
    },
    {
      name: 'Products',
      href: '/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      name: 'Comparisons',
      href: '/comparisons',
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-white border-r transition-all duration-300", 
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="font-bold text-lg">Kung Gestion</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 mx-2 rounded-md hover:bg-gray-100 transition-colors",
                isActive ? "bg-gray-100 text-primary" : "text-gray-600"
              )}
            >
              <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
                {item.icon}
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;