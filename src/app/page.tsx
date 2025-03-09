"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RainEffect from './components/ShootingStars';

interface PageContent {
  home: string;
  homeImages: string[];
}

export default function Home() {
  const [content, setContent] = useState<PageContent>({
    home: "",
    homeImages: []
  });

  useEffect(() => {
    const savedContent = localStorage.getItem('page_content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent({
          home: parsedContent.home || "",
          homeImages: parsedContent.homeImages || []
        });
      } catch (error) {
        console.error('Error loading content:', error);
      }
    }
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'rgb(71, 79, 95)' }}>
      <RainEffect />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 px-4 backdrop-blur-sm bg-black/20 rounded-xl p-8"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Welcome to My Website
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
          {content.home}
        </p>
      </motion.div>
    </main>
  );
}
