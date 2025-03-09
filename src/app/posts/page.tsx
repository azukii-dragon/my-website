"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem('blog_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  if (selectedPost) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="text-white mb-6 flex items-center hover:text-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Posts
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedPost.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {new Date(selectedPost.date).toLocaleDateString()}
            </p>
            <div className="prose dark:prose-invert max-w-none">
              {selectedPost.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-8">Blog Posts</h1>
        
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {new Date(post.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {post.excerpt}
              </p>
              <button
                onClick={() => setSelectedPost(post)}
                className="mt-4 text-[#7d8fb0] hover:text-[#6b7a96] dark:text-[#7d8fb0] dark:hover:text-[#6b7a96] font-medium"
              >
                Read more →
              </button>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div className="text-center text-gray-300">
              <p>No blog posts yet.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 