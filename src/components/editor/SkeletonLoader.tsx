import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'full' | 'minimal' | 'compact';
  animated?: boolean;
}

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0%', '-200% 0%'],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const pulse = {
  animate: {
    opacity: [0.6, 1, 0.6],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Full page skeleton
export function FullPageSkeleton({ animated = true }: SkeletonLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full space-y-4 p-6"
    >
      {/* Header */}
      <motion.div
        variants={pulse}
        animate={animated ? 'animate' : undefined}
        className="h-12 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg"
      />

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          <motion.div
            variants={pulse}
            animate={animated ? 'animate' : undefined}
            className="h-32 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg"
          />
          <motion.div
            variants={pulse}
            animate={animated ? 'animate' : undefined}
            className="h-64 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <motion.div
            variants={pulse}
            animate={animated ? 'animate' : undefined}
            className="h-24 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg"
          />
          <motion.div
            variants={pulse}
            animate={animated ? 'animate' : undefined}
            className="h-32 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Minimal skeleton for quick preview
export function MinimalSkeleton({ animated = true }: SkeletonLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full space-y-3 p-4"
    >
      <motion.div
        variants={pulse}
        animate={animated ? 'animate' : undefined}
        className="h-8 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-blue-500/20 rounded-lg"
      />
      <motion.div
        variants={pulse}
        animate={animated ? 'animate' : undefined}
        className="h-20 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg"
        style={{ animationDelay: '0.2s' }}
      />
      <motion.div
        variants={pulse}
        animate={animated ? 'animate' : undefined}
        className="h-40 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg"
        style={{ animationDelay: '0.4s' }}
      />
    </motion.div>
  );
}

// Compact skeleton for sidebars
export function CompactSkeleton({ animated = true }: SkeletonLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-2"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          variants={pulse}
          animate={animated ? 'animate' : undefined}
          className="h-10 bg-gradient-to-r from-white/5 via-white/8 to-white/5 rounded-lg"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </motion.div>
  );
}

// Chat message skeleton
export function ChatMessageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <motion.div
        variants={pulse}
        animate="animate"
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20"
      />
      <div className="flex-1 space-y-2">
        <motion.div
          variants={pulse}
          animate="animate"
          className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded w-3/4"
        />
        <motion.div
          variants={pulse}
          animate="animate"
          className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded w-5/6"
          style={{ animationDelay: '0.1s' }}
        />
      </div>
    </motion.div>
  );
}

// Shimmer text effect (for code preview)
export function ShimmerText({ text }: { text: string }) {
  return (
    <motion.span
      variants={shimmer}
      animate="animate"
      className="inline-block bg-gradient-to-r from-transparent via-white/30 to-transparent bg-200% text-transparent bg-clip-text"
      style={{
        backgroundSize: '200% 100%',
      }}
    >
      {text}
    </motion.span>
  );
}

// Visual hook for file items
export function FileItemSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-2 py-2"
    >
      <div className="flex items-center gap-2">
        <motion.div
          variants={pulse}
          animate="animate"
          className="w-4 h-4 bg-white/10 rounded"
        />
        <motion.div
          variants={pulse}
          animate="animate"
          className="h-3 bg-white/5 rounded flex-1 w-24"
        />
      </div>
    </motion.div>
  );
}

// Loading state with dots
interface LoadingDotsProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingDots({ message, size = 'md' }: LoadingDotsProps) {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [-8, 8, -8],
              backgroundColor: ['rgba(59, 130, 246, 0.4)', 'rgba(168, 85, 247, 0.8)', 'rgba(59, 130, 246, 0.4)'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className={cn(dotSizes[size], 'rounded-full bg-blue-500')}
          />
        ))}
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/60"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

// Animated border component
export function AnimatedBorder() {
  return (
    <div className="relative h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent overflow-hidden">
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
      />
    </div>
  );
}
