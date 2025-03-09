"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useSearchParams } from 'next/navigation';

interface GalleryImage {
  url: string;
  caption: string;
  timestamp: number;
  category: string;
}

type Category = 'all' | 'my-art' | 'bambi' | 'animanga';

export default function Gallery() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as Category;
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [newCaption, setNewCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(categoryParam || 'all');
  const [newCategory, setNewCategory] = useState<Category>('my-art');
  const { isAuthenticated } = useAuth();
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
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
        // Create a temporary image to compress
        const img = new Image();
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
        img.src = reader.result as string;
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
    if (!imageRef.current || !editingImage) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const image = new Image();
    image.src = editingImage.url;
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropComplete = () => {
    const croppedImageUrl = getCroppedImg();
    if (croppedImageUrl && editingImage) {
      setEditingImage({ ...editingImage, url: croppedImageUrl });
      setIsCropping(false);
    }
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
    setIsCropping(false);
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
                <div className="aspect-square overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover"
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
                        <div className="relative">
                          {isCropping ? (
                            <div>
                              <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                aspect={1}
                              >
                                <img
                                  ref={imageRef}
                                  src={editingImage.url}
                                  alt="Crop me"
                                  className="max-w-full h-auto"
                                />
                              </ReactCrop>
                              <div className="mt-4 flex justify-center gap-4">
                                <button
                                  type="button"
                                  onClick={handleCropComplete}
                                  className="bg-[#7d8fb0] text-white px-4 py-2 rounded-md hover:bg-[#6b7a96]"
                                >
                                  Apply Crop
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsCropping(false)}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <img
                                src={editingImage.url}
                                alt={editingImage.caption}
                                className="w-full h-auto rounded-md"
                              />
                              <button
                                onClick={() => setIsCropping(true)}
                                className="absolute top-2 right-2 bg-[#7d8fb0] text-white p-2 rounded-full hover:bg-[#6b7a96] transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-8 8-4-4" />
                                </svg>
                              </button>
                            </div>
                          )}
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
                            setIsCropping(false);
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