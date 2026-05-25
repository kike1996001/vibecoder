import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreamingAnimationProps {
  isStreaming: boolean;
  progress?: number;
  message?: string;
}

const streamingDots = {
  animate: {
    opacity: [0.4, 1, 0.4],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const pulseRing = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0.7)',
      '0 0 0 10px rgba(59, 130, 246, 0.3)',
      '0 0 0 20px rgba(59, 130, 246, 0)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeOut',
  },
};

const floatingParticles = {
  animate: {
    y: [-20, 20, -20],
    opacity: [0, 1, 0],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export function StreamingAnimation({ isStreaming, progress = 0, message }: StreamingAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    if (!isStreaming) return;

    // Generate random floating particles
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [isStreaming]);

  if (!isStreaming) return null;

  return (
    <div className="relative w-full h-full">
      {/* Central Pulse */}
      <motion.div
        variants={pulseRing}
        animate="animate"
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-full border-2 border-blue-500/30" />
      </motion.div>

      {/* Inner Animated Circle */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-24 h-24 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500" />
      </motion.div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          variants={floatingParticles}
          animate="animate"
          transition={{
            ...floatingParticles.transition,
            delay: particle.delay,
          }}
          className="absolute w-1 h-1 rounded-full bg-blue-400"
          style={{ left: `${particle.left}%`, top: '20%' }}
        />
      ))}

      {/* Streaming Status Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                variants={streamingDots}
                animate="animate"
                transition={{
                  ...streamingDots.transition,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-blue-400"
              />
            ))}
          </div>
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/60"
            >
              {message}
            </motion.p>
          )}
          {progress > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-blue-400 font-semibold"
            >
              {Math.round(progress)}%
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

// Advanced status bar component
interface AdvancedStatusBarProps {
  status: string;
  progress: number;
  isGenerating: boolean;
}

export function AdvancedStatusBar({ status, progress, isGenerating }: AdvancedStatusBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full space-y-2"
    >
      {/* Status Text with animated accent */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
        <p className="text-sm text-white/70">{status}</p>
      </div>

      {/* Advanced Progress Bar */}
      <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]">
        <motion.div
          layoutId="progress"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 shadow-lg shadow-blue-500/50"
        />
        
        {/* Shimmer Effect */}
        {isGenerating && (
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-wider text-white/40">Generating...</span>
        <span className="text-xs font-semibold text-white/60">{Math.round(progress)}%</span>
      </div>
    </motion.div>
  );
}
