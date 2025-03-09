"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

interface PageContent {
  home: string;
  bio: string;
  socials: string;
  homeImages: string[];
}

interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
}

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'pages'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPosts = localStorage.getItem('blog_posts');
      return savedPosts ? JSON.parse(savedPosts) : [];
    }
    return [];
  });
  const [content, setContent] = useState<PageContent>({
    home: "",
    bio: "",
    socials: "",
    homeImages: []
  });

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState<BlogPost>({
    id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    excerpt: ''
  });

  useEffect(() => {
    // Load existing content
    const savedContent = localStorage.getItem('page_content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent(prev => ({
          ...prev,
          home: parsedContent.home || "",
          bio: parsedContent.bio || "",
          socials: parsedContent.socials || "",
          homeImages: parsedContent.homeImages || []
        }));
      } catch (error) {
        console.error('Error loading content:', error);
      }
    }
  }, []);

  // Save posts to localStorage whenever they change
  const savePosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      // Update existing post
      const updatedPosts = posts.map(post =>
        post.id === editingPost.id ? { ...newPost, id: editingPost.id } : post
      );
      savePosts(updatedPosts);
    } else {
      // Add new post
      savePosts([...posts, { ...newPost, id: Date.now().toString() }]);
    }
    setNewPost({
      id: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      excerpt: ''
    });
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      savePosts(posts.filter(post => post.id !== id));
    }
  };

  const handleContentChange = (section: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const handleImageAdd = (url: string) => {
    if (!url.trim()) return;
    setContent(prev => ({
      ...prev,
      homeImages: [...prev.homeImages, url]
    }));
  };

  const handleImageRemove = (index: number) => {
    setContent(prev => ({
      ...prev,
      homeImages: prev.homeImages.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    localStorage.setItem('page_content', JSON.stringify(content));
    alert('Content saved successfully!');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Please log in to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'posts'
                  ? 'bg-[#7d8fb0] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Manage Posts
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'pages'
                  ? 'bg-[#7d8fb0] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Edit Pages
            </button>
          </div>
        </div>

        {activeTab === 'posts' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newPost.date}
                  onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={6}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                {editingPost && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(null);
                      setNewPost({
                        id: '',
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        content: '',
                        excerpt: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7d8fb0] text-white rounded-md hover:bg-[#6b7a96]"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Existing Posts
              </h3>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setNewPost(post);
                        }}
                        className="text-[#7d8fb0] hover:text-[#6b7a96]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Page Content
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Home Page Content
                </label>
                <textarea
                  value={content.home}
                  onChange={(e) => handleContentChange('home', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio Content
                </label>
                <textarea
                  value={content.bio}
                  onChange={(e) => handleContentChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Home Page Floating Images
                </label>
                <div className="space-y-4">
                  {content.homeImages.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={image}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter image URL"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleImageAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Socials & Contact Information
                </label>
                <textarea
                  value={content.socials}
                  onChange={(e) => handleContentChange('socials', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Email: your@email.com&#10;Twitter: @username&#10;Instagram: @username"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save All Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
} 