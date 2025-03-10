"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  caption: string;
  timestamp: number;
  category: string;
}

type Category = 'all' | 'my-art' | 'bambi' | 'animanga';

function GalleryContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as Category;
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [newCaption, setNewCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(categoryParam || 'all');
  const [newCategory, setNewCategory] = useState<Category>('my-art');
  const { isAuthenticated } = useAuth();
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'my-art', label: 'My Art' },
    { id: 'bambi', label: 'Bambi' },
    { id: 'animanga', label: 'Animanga' },
  ];

  useEffect(() => {
    const savedImages = localStorage.getItem('gallery_images');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = document.createElement('img');
          img.onload = () => {
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Max dimensions
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            
            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Get compressed image data (0.7 quality)
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            const newImage: GalleryImage = {
              url: compressedUrl,
              caption: newCaption,
              timestamp: Date.now(),
              category: newCategory
            };
            const updatedImages = [...images, newImage];
            setImages(updatedImages);
            localStorage.setItem('gallery_images', JSON.stringify(updatedImages));
            setNewCaption('');
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (timestamp: number) => {
    const updatedImages = images.filter(img => img.timestamp !== timestamp);
    setImages(updatedImages);
    localStorage.setItem('gallery_images', JSON.stringify(updatedImages));
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setIsEditModalOpen(true);
  };

  const getCroppedImg = () => {
    // Since we're not using cropping functionality, we can return null
    return null;
  };

  const handleSaveEdit = (updatedCaption: string, updatedCategory: Category) => {
    if (!editingImage) return;

    const updatedImages = images.map(img => 
      img.timestamp === editingImage.timestamp 
        ? { ...editingImage, caption: updatedCaption, category: updatedCategory }
        : img
    );
    setImages(updatedImages);
    localStorage.setItem('gallery_images', JSON.stringify(updatedImages));
    setIsEditModalOpen(false);
    setEditingImage(null);
  };

  const filteredImages = images.filter(image => 
    selectedCategory === 'all' ? true : image.category === selectedCategory
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4" style={{ backgroundColor: 'rgb(71, 79, 95)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <h1 className="text-4xl font-bold text-white mb-8">My Gallery</h1>
          
          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#7d8fb0] text-white'
                    : 'bg-black/30 text-gray-300 hover:bg-[#7d8fb0]/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Upload Section - Only visible when authenticated */}
          {isAuthenticated && (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white w-full sm:w-auto"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white"
                >
                  {categories.filter(cat => cat.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <label className="px-4 py-2 bg-[#7d8fb0] hover:bg-[#6b7a96] text-white rounded-lg cursor-pointer transition-colors">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <motion.div
                key={image.timestamp}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm relative">
                  <Image
                    src={image.url}
                    alt={image.caption}
                    width={500}
                    height={500}
                    className="object-cover w-full h-full"
                    priority={false}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                  <p className="text-white text-xs">{image.caption}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {categories.find(cat => cat.id === image.category)?.label}
                  </p>
                  {isAuthenticated && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => handleEdit(image)}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeImage(image.timestamp)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Edit Modal */}
          {isAuthenticated && (
            <AnimatePresence>
              {isEditModalOpen && editingImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Edit Image
                    </h3>
                    <div className="space-y-4">
                      {/* Image Preview and Crop */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Image
                        </label>
                        <div className="relative w-full h-[400px]">
                          <Image
                            ref={imageRef}
                            src={editingImage.url}
                            alt={editingImage.caption}
                            width={800}
                            height={800}
                            className="max-w-full max-h-[80vh] object-contain"
                            priority
                          />
                        </div>
                      </div>

                      {/* Caption and Category inputs */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Caption
                        </label>
                        <input
                          type="text"
                          value={editingImage.caption}
                          onChange={(e) => setEditingImage({ ...editingImage, caption: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={editingImage.category}
                          onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value as Category })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        >
                          {categories.filter(cat => cat.id !== 'all').map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-4 mt-6">
                        <button
                          onClick={() => {
                            setIsEditModalOpen(false);
                            setEditingImage(null);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(editingImage.caption, editingImage.category as Category)}
                          className="px-4 py-2 bg-[#7d8fb0] text-white rounded-md hover:bg-[#6b7a96]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryContent />
    </Suspense>
  );
} 