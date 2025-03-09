"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function Navigation() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-[#2c3440] p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className={`text-white hover:text-gray-300 ${pathname === '/' ? 'font-bold' : ''}`}>
            azuki&apos;s page
          </Link>
          // ... rest of the code ...
        </div>
      </div>
    </nav>
  );
} 