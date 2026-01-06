'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* SVG Noise/Grain Filter */}
      <svg className="absolute inset-0">
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Noise Overlay */}
      <div
        className="absolute inset-0 dark:opacity-[0.015] opacity-[0.008]"
        style={{
          filter: 'url(#noiseFilter)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Animated Gradient Orbs - Katalyst style (very subtle) */}
      <motion.div
        className="absolute w-[1000px] h-[1000px] rounded-full transition-opacity duration-1000"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0) 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, rgba(59,130,246,0) 70%)',
          filter: 'blur(120px)',
          top: '-20%',
          left: '-10%',
        }}
        animate={{
          x: ['-10%', '5%', '-10%'],
          y: ['-5%', '10%', '-5%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full transition-opacity duration-1000"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, rgba(139,92,246,0) 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, rgba(139,92,246,0) 70%)',
          filter: 'blur(100px)',
          bottom: '-10%',
          right: '-5%',
        }}
        animate={{
          x: ['0%', '-10%', '0%'],
          y: ['0%', '8%', '0%'],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,10,0.3) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.2) 100%)',
        }}
      />
    </div>
  );
}
