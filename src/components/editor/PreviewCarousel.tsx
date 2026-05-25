import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewSlide {
  id: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  icon: React.ReactNode;
  progress: number;
}

interface PreviewCarouselProps {
  slides?: PreviewSlide[];
  isGenerating?: boolean;
  isStreaming?: boolean;
  currentProgress?: number;
  autoPlay?: boolean;
}

// Default skeleton slides showing app building stages
const DEFAULT_SLIDES: PreviewSlide[] = [
  {
    id: 'structure',
    title: 'Building Structure',
    description: 'Creating app architecture and components',
    progress: 20,
    icon: <Zap className="w-4 h-4" />,
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent flex items-center justify-center">
        <div className="space-y-3 w-full px-6">
          <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-6 bg-white/10 rounded-lg animate-pulse w-3/4" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'styling',
    title: 'Applying Styles',
    description: 'Adding design tokens and animations',
    progress: 50,
    icon: <Sparkles className="w-4 h-4" />,
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-transparent flex items-center justify-center">
        <div className="space-y-3 w-full px-6">
          <div className="h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-20 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'interactions',
    title: 'Adding Interactions',
    description: 'Implementing functionality and state management',
    progress: 80,
    icon: <Zap className="w-4 h-4" />,
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-transparent flex items-center justify-center">
        <div className="space-y-4 w-full px-6">
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-blue-500/20 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-purple-500/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    id: 'polish',
    title: 'Final Polish',
    description: 'Optimizing performance and user experience',
    progress: 100,
    icon: <Sparkles className="w-4 h-4" />,
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-transparent flex items-center justify-center">
        <div className="space-y-3 w-full px-6">
          <div className="h-12 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-lg flex items-center justify-center">
            <div className="text-2xl">✨</div>
          </div>
          <div className="text-center text-white/60 text-sm">App ready to preview!</div>
        </div>
      </div>
    ),
  },
];

export function PreviewCarousel({
  slides = DEFAULT_SLIDES,
  isGenerating = false,
  isStreaming = false,
  currentProgress = 0,
  autoPlay = true,
}: PreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Auto-advance carousel based on progress
  useEffect(() => {
    if (!isGenerating || !autoPlay) return;

    const slideIndex = Math.floor((currentProgress / 100) * (slides.length - 1));
    if (slideIndex !== currentIndex && slideIndex < slides.length) {
      setDirection('right');
      setCurrentIndex(slideIndex);
    }
  }, [currentProgress, isGenerating, autoPlay, slides.length, currentIndex]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(Math.max(0, Math.min(index, slides.length - 1)));
  };

  const goToPrevious = () => {
    setDirection('left');
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0b11] rounded-lg border border-white/[0.06] overflow-hidden">
      {/* Preview Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0b0b11] to-[#0a0a0f]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, x: direction === 'right' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'right' ? -100 : 100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {currentSlide.preview}
          </motion.div>
        </AnimatePresence>

        {/* Streaming Indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300 font-medium">Streaming...</span>
          </motion.div>
        )}

        {/* Progress indicator overlay */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/5"
          >
            <motion.div
              layoutId="progress-bar"
              initial={{ width: '0%' }}
              animate={{ width: `${currentProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 shadow-lg shadow-blue-500/50"
            />
          </motion.div>
        )}
      </div>

      {/* Slide Info & Controls */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0a0f]/50 backdrop-blur p-4">
        {/* Slide Title & Description */}
        <div className="mb-3">
          <motion.div
            key={`title-${currentSlide.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-1"
          >
            <div className="text-blue-400">{currentSlide.icon}</div>
            <h3 className="text-sm font-semibold text-white">{currentSlide.title}</h3>
          </motion.div>
          <p className="text-xs text-white/50">{currentSlide.description}</p>
        </div>

        {/* Progress Text */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-white/40">Progress</span>
            <span className="text-xs font-semibold text-white/70">{currentSlide.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentSlide.progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>

        {/* Slide Indicators & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === currentIndex ? 'bg-blue-500 w-6' : 'bg-white/20 w-1.5'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNext}
              disabled={currentIndex === slides.length - 1}
              className="p-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
