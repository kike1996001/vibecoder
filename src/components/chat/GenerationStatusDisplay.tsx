import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

interface StatusMessage {
  message: string;
  progress: number;
  timestamp: number;
}

interface GenerationStatusDisplayProps {
  isGenerating: boolean;
  currentStatus?: string;
  progress?: number;
  statusHistory?: StatusMessage[];
  designSystem?: {
    colorPalette?: { name: string };
    typography?: { name: string };
    layoutDirection?: { name: string };
  };
}

export function GenerationStatusDisplay({
  isGenerating,
  currentStatus = 'Initializing...',
  progress = 0,
  statusHistory = [],
  designSystem,
}: GenerationStatusDisplayProps) {
  const [displayedMessage, setDisplayedMessage] = useState(currentStatus);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  // Update displayed message when status changes
  useEffect(() => {
    if (currentStatus && currentStatus !== displayedMessage) {
      setDisplayedMessage(currentStatus);
      setMessageHistory((prev) => [...prev.slice(-4), currentStatus]); // Keep last 5 messages
    }
  }, [currentStatus, displayedMessage]);

  if (!isGenerating && progress === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3"
    >
      {/* Main Status Message */}
      <motion.div
        key={displayedMessage}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className="flex items-start gap-3"
      >
        <motion.div
          animate={{ rotate: isGenerating ? 360 : 0 }}
          transition={{ duration: 2, repeat: isGenerating ? Infinity : 0 }}
          className="shrink-0 mt-0.5"
        >
          {isGenerating ? (
            <Zap className="w-4 h-4 text-blue-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-blue-200 truncate"
          >
            {displayedMessage}
          </motion.p>

          {/* Design System Info */}
          {designSystem && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-xs text-blue-300/70 space-y-1"
            >
              {designSystem.colorPalette && (
                <div>🎨 Color: {designSystem.colorPalette.name}</div>
              )}
              {designSystem.typography && (
                <div>✍️ Typography: {designSystem.typography.name}</div>
              )}
              {designSystem.layoutDirection && (
                <div>📐 Layout: {designSystem.layoutDirection.name}</div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-300/60">Progress</span>
          <span className="text-blue-300/60">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Message History (Optional) */}
      {messageHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-blue-300/40 space-y-0.5 max-h-12 overflow-y-auto"
        >
          {messageHistory.slice(0, -1).map((msg, idx) => (
            <div key={idx} className="line-clamp-1">
              • {msg}
            </div>
          ))}
        </motion.div>
      )}

      {/* Completion State */}
      {!isGenerating && progress >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-green-400 text-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Generation complete! Preview loading...</span>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Minimal status display for compact mode
 */
export function CompactGenerationStatus({
  isGenerating,
  currentStatus = '',
  progress = 0,
}: {
  isGenerating: boolean;
  currentStatus?: string;
  progress?: number;
}) {
  if (!isGenerating && progress === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-xs text-blue-300/70"
    >
      {isGenerating ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="shrink-0"
          >
            <Zap className="w-3 h-3" />
          </motion.div>
          <span className="truncate">{currentStatus}</span>
          <span className="text-blue-300/50">{Math.round(progress)}%</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
          <span>Complete</span>
        </>
      )}
    </motion.div>
  );
}
