"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AnimeContent {
  title: string;
  description: string;
  images: string[];
}

interface FloatingImage {
  src: string;
  scale: number;
  duration: number;
  isLoaded: boolean;
  startAngle: number;
}

export default function AnimePage() {
  const [content, setContent] = useState<AnimeContent>({
    title: "My Anime Collection",
    description: "Welcome to my anime and manga showcase! Here you'll find some of my favorite characters and series.",
    images: []
  });
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
  const orbitRadius = 330;

  useEffect(() => {
    const savedContent = localStorage.getItem('anime_content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent(parsedContent);
      } catch (error) {
        console.error('Error loading anime content:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Create floating image configurations
    const newFloatingImages = content.images.map((src, index) => ({
      src: src.startsWith('@') ? src.slice(1) : src,
      scale: 0.9 + Math.random() * 0.2,
      duration: 30 + (Math.random() * 10), // Slightly randomized duration for more natural movement
      isLoaded: false,
      startAngle: (index * (360 / content.images.length))
    }));
    setFloatingImages(newFloatingImages);
  }, [content.images]);

  const handleImageLoad = (index: number) => {
    console.log(`Image ${index} loaded successfully:`, floatingImages[index].src);
    setFloatingImages(prev => prev.map((img, i) => 
      i === index ? { ...img, isLoaded: true } : img
    ));
  };

  const handleImageError = (index: number) => {
    console.error(`Image ${index} failed to load:`, floatingImages[index].src);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      <div className="relative w-[600px] h-[600px] flex items-center justify-center">
        {/* Central text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center z-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-200 max-w-xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        {/* Orbiting images */}
        {floatingImages.map((image, index) => (
          <motion.div
            key={`${image.src}-${index}`}
            className="absolute"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: image.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: '120px',
              height: '120px',
              top: '50%',
              left: '50%',
              margin: '-60px 0 0 -60px',
              transformOrigin: 'center'
            }}
          >
            <motion.div 
              className={`absolute rounded-full overflow-hidden ${!image.isLoaded ? 'bg-gray-200' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                transform: `rotate(${image.startAngle}deg) translateX(${orbitRadius}px) rotate(-${image.startAngle}deg)`,
              }}
            >
              <img
                src={image.src}
                alt=""
                className="w-full h-full object-cover rounded-full"
                onError={() => handleImageError(index)}
                onLoad={() => handleImageLoad(index)}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 