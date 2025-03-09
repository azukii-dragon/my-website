"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center">
        <Link 
          href="/"
          className="text-2xl font-bold mr-8"
        >
          My Website
        </Link>
        <div className="flex space-x-6 flex-grow">
          <Link 
            href="/" 
            className={`text-xl hover:text-gray-300 ${pathname === '/' ? 'border-b-2 border-blue-400' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/bio" 
            className={`text-xl hover:text-gray-300 ${pathname === '/bio' ? 'border-b-2 border-blue-400' : ''}`}
          >
            Bio
          </Link>
          <Link 
            href="/gallery" 
            className={`text-xl hover:text-gray-300 ${pathname === '/gallery' ? 'border-b-2 border-blue-400' : ''}`}
          >
            Gallery
          </Link>
          <Link 
            href="/pets" 
            className={`text-xl hover:text-gray-300 ${pathname === '/pets' ? 'border-b-2 border-blue-400' : ''}`}
          >
            Pets
          </Link>
          <Link 
            href="/posts" 
            className={`text-xl hover:text-gray-300 ${pathname === '/posts' ? 'border-b-2 border-blue-400' : ''}`}
          >
            Posts
          </Link>
          <Link 
            href="/admin" 
            className={`text-xl hover:text-gray-300 ${pathname === '/admin' ? 'border-b-2 border-blue-400' : ''}`}
          >
            Admin
          </Link>
        </div>
        <div className="flex items-center">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
} 