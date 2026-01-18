'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function BeerBottleAnimation() {
  return (
    <div className="relative w-40 h-96 flex items-center justify-center">
      {/* Shadow */}
      <div className="absolute bottom-0 w-32 h-4 bg-black/20 rounded-full blur-xl" />

      {/* Floating animation wrapper */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        {/* Try to load image first, fallback to SVG */}
        <div className="relative w-32 h-80 flex items-center justify-center">
          <img
            src="/beer-bottle.png"
            alt="Cerveja Realista"
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>

        {/* SVG Fallback - will show if image doesn't exist */}
        <svg
          viewBox="0 0 120 280"
          className="w-32 h-80 hidden"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs for gradients */}
          <defs>
            {/* Glass gradient */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d3b1f" stopOpacity="0.3" />
              <stop offset="20%" stopColor="#1a5c2e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0d3b1f" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#1a5c2e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0d3b1f" stopOpacity="0.3" />
            </linearGradient>

            {/* Beer liquid gradient */}
            <linearGradient id="beerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c9a961" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#d4a574" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c9a961" stopOpacity="0.7" />
            </linearGradient>

            {/* Shine gradient */}
            <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Bottle cap/crown */}
          <rect x="45" y="8" width="30" height="10" rx="2" fill="#c9a961" />
          <rect x="42" y="18" width="36" height="4" fill="#b8956a" />

          {/* Bottle neck - glass */}
          <path
            d="M 48 22 L 42 35 L 78 35 L 72 22 Z"
            fill="url(#glassGradient)"
            stroke="#0d3b1f"
            strokeWidth="0.5"
          />

          {/* Main bottle body - glass */}
          <path
            d="M 42 35 Q 38 55 36 100 Q 35 150 40 210 Q 60 235 80 210 Q 85 150 84 100 Q 82 55 78 35 Z"
            fill="url(#glassGradient)"
            stroke="#0d3b1f"
            strokeWidth="0.5"
          />

          {/* Beer liquid inside - animated */}
          <motion.path
            d="M 42 110 Q 38 130 36 170 Q 35 195 40 210 Q 60 230 80 210 Q 85 195 84 170 Q 82 130 78 110 Z"
            fill="url(#beerGradient)"
            animate={{
              d: [
                'M 42 110 Q 38 130 36 170 Q 35 195 40 210 Q 60 230 80 210 Q 85 195 84 170 Q 82 130 78 110 Z',
                'M 42 105 Q 38 125 36 165 Q 35 190 40 210 Q 60 230 80 210 Q 85 190 84 165 Q 82 125 78 105 Z',
                'M 42 110 Q 38 130 36 170 Q 35 195 40 210 Q 60 230 80 210 Q 85 195 84 170 Q 82 130 78 110 Z',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Foam head - animated */}
          <motion.ellipse
            cx="60"
            cy="105"
            rx="18"
            ry="8"
            fill="#f5e6d3"
            opacity="0.9"
            animate={{
              ry: [8, 6, 8],
              opacity: [0.9, 0.7, 0.9],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Foam bubbles */}
          <motion.circle
            cx="45"
            cy="100"
            r="3"
            fill="#f5e6d3"
            opacity="0.8"
            animate={{
              y: [-8, -20, -8],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="60"
            cy="98"
            r="2.5"
            fill="#f5e6d3"
            opacity="0.7"
            animate={{
              y: [-8, -22, -8],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle
            cx="75"
            cy="102"
            r="3"
            fill="#f5e6d3"
            opacity="0.8"
            animate={{
              y: [-8, -18, -8],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
          />

          {/* Main highlight/shine */}
          <ellipse
            cx="48"
            cy="80"
            rx="6"
            ry="35"
            fill="url(#shine)"
            opacity="0.6"
          />

          {/* Secondary highlight */}
          <ellipse
            cx="72"
            cy="120"
            rx="3"
            ry="25"
            fill="#ffffff"
            opacity="0.2"
          />

          {/* Condensation drops - animated */}
          <motion.circle
            cx="36"
            cy="60"
            r="1.5"
            fill="#ffffff"
            opacity="0.5"
            animate={{
              y: [0, 40, 0],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="84"
            cy="75"
            r="1"
            fill="#ffffff"
            opacity="0.4"
            animate={{
              y: [0, 35, 0],
              opacity: [0.4, 0.1, 0.4],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle
            cx="36"
            cy="140"
            r="1.2"
            fill="#ffffff"
            opacity="0.45"
            animate={{
              y: [0, 30, 0],
              opacity: [0.45, 0.15, 0.45],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />

          {/* Label area - subtle */}
          <rect
            x="45"
            y="130"
            width="30"
            height="50"
            fill="#d4a574"
            opacity="0.15"
            rx="2"
          />
          <text
            x="60"
            y="160"
            textAnchor="middle"
            fontSize="8"
            fill="#8b7355"
            opacity="0.4"
            fontWeight="bold"
          >
            BREWJARIA
          </text>
        </svg>
      </motion.div>

      {/* Glow effect behind */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 30px rgba(242, 201, 76, 0.2)',
            '0 0 60px rgba(242, 201, 76, 0.4)',
            '0 0 30px rgba(242, 201, 76, 0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-2xl"
      />
    </div>
  )
}
