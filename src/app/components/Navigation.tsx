"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-[#2c3440] p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className={`text-white hover:text-gray-300 ${pathname === '/' ? 'font-bold' : ''}`}>
            azuki&apos;s page
          </Link>
          <Link href="/bio" className={`text-white hover:text-gray-300 ${pathname === '/bio' ? 'font-bold' : ''}`}>
            Bio
          </Link>
          <Link href="/pets" className={`text-white hover:text-gray-300 ${pathname === '/pets' ? 'font-bold' : ''}`}>
            Pets
          </Link>
          <Link href="/gallery" className={`text-white hover:text-gray-300 ${pathname === '/gallery' ? 'font-bold' : ''}`}>
            Gallery
          </Link>
          <Link href="/posts" className={`text-white hover:text-gray-300 ${pathname === '/posts' ? 'font-bold' : ''}`}>
            Posts
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/admin" className={`text-white hover:text-gray-300 ${pathname === '/admin' ? 'font-bold' : ''}`}>
                Admin
              </Link>
              <button onClick={logout} className="text-white hover:text-gray-300">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={`text-white hover:text-gray-300 ${pathname === '/login' ? 'font-bold' : ''}`}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 