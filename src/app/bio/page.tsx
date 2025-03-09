"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Bio() {
  const [content, setContent] = useState("Hello! I'm a pet enthusiast and technology lover. I created this website to share my journey with my beloved pets and connect with other pet owners.");
  const [socials, setSocials] = useState("Email: contact@example.com\nTwitter: @petlover\nInstagram: @petgram");

  useEffect(() => {
    const savedContent = localStorage.getItem('page_content');
    if (savedContent) {
      const parsedContent = JSON.parse(savedContent);
      if (parsedContent.bio) {
        setContent(parsedContent.bio);
      }
      if (parsedContent.socials) {
        setSocials(parsedContent.socials);
      }
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <h1 className="text-4xl font-bold text-white mb-8">About Me</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {content}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect With Me</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {socials}
          </p>
        </div>
      </motion.div>
    </div>
  );
} 