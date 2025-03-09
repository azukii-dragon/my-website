"use client";

import { motion } from 'framer-motion';

export default function RainEffect() {
  // Create more raindrops with faster speeds
  const raindrops = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1,
    initialX: Math.random() * 100,
    speed: 0.3 + Math.random() * 0.4,
    opacity: 0.2 + Math.random() * 0.3,
    width: 0.5 + Math.random() * 1.5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute bg-white/40"
          style={{
            top: '-20px',
            left: `${drop.initialX}%`,
            width: `${drop.width}px`,
            height: '80px',
            opacity: drop.opacity,
          }}
          animate={{
            y: ['-20px', '100vh']
          }}
          transition={{
            duration: drop.speed,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
} 