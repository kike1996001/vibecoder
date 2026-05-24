import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';

export interface StatusMessage {
  id: string;
  text: string;
  phase: 'analyzing' | 'planning' | 'generating' | 'styling' | 'refining' | 'finalizing';
  timestamp: number;
  completed: boolean;
}

interface StatusMessagesProps {
  messages: StatusMessage[];
  isActive: boolean;
}

/**
 * StatusMessages Component
 * Displays real-time status messages with animations
 * Shows what Claude is doing during code generation
 */
export const StatusMessages: React.FC<StatusMessagesProps> = ({ messages, isActive }) => {
  const [displayedMessages, setDisplayedMessages] = useState<StatusMessage[]>([]);

  // Update displayed messages
  useEffect(() => {
    setDisplayedMessages(messages);
  }, [messages]);

  if (!isActive || displayedMessages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <AnimatePresence mode="popLayout">
        {displayedMessages.map((message, index) => (
          <motion.div
            key={message.id}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              height: 'auto',
              transition: {
                duration: 0.4,
                ease: 'easeOut',
              },
            }}
            exit={{
              opacity: 0,
              x: -20,
              height: 0,
              transition: {
                duration: 0.3,
                ease: 'easeIn',
              },
            }}
            className="mb-2 overflow-hidden"
          >
            <motion.div
              className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                message.completed
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-violet-500/10 text-violet-300'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {message.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                )}
              </div>

              {/* Message Text */}
              <div className="flex-1 min-w-0">
                <motion.p
                  className="leading-relaxed truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {message.text}
                </motion.p>
              </div>

              {/* Phase Badge */}
              <motion.div
                className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider opacity-60"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {getPhaseLabel(message.phase)}
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Progress indicator showing messages processed */}
      {displayedMessages.length > 0 && (
        <motion.div
          className="mt-3 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-[10px] text-white/40">
            {displayedMessages.filter((m) => m.completed).length}/{displayedMessages.length}
          </div>
          {/* Dots */}
          <div className="flex gap-1">
            {displayedMessages.map((message, index) => (
              <motion.div
                key={`dot-${index}`}
                className={`w-1 h-1 rounded-full ${
                  message.completed ? 'bg-emerald-400' : 'bg-violet-400'
                }`}
                animate={
                  !message.completed
                    ? { opacity: [0.4, 1, 0.4] }
                    : { opacity: 1 }
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Get human-readable label for phase
 */
function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    analyzing: 'Análisis',
    planning: 'Planificación',
    generating: 'Generación',
    styling: 'Estilos',
    refining: 'Refinamiento',
    finalizing: 'Finalización',
  };

  return labels[phase] || phase;
}

/**
 * Hook to manage status messages with proper timing and sequencing
 */
export function useStatusMessages(
  messageTexts: string[],
  isGenerating: boolean,
  interval: number = 3000
) {
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      // Mark all as completed when generation finishes
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          completed: true,
        }))
      );
      return;
    }

    if (messageIndex >= messageTexts.length) {
      return;
    }

    const timer = setTimeout(() => {
      const newMessage: StatusMessage = {
        id: `msg-${Date.now()}`,
        text: messageTexts[messageIndex],
        phase: getPhaseFromIndex(messageIndex, messageTexts.length),
        timestamp: Date.now(),
        completed: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessageIndex((prev) => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [isGenerating, messageIndex, messageTexts, interval]);

  // Reset when isGenerating becomes false
  useEffect(() => {
    if (!isGenerating) {
      const timer = setTimeout(() => {
        setMessages([]);
        setMessageIndex(0);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  return messages;
}

/**
 * Determine phase based on message index
 */
function getPhaseFromIndex(
  index: number,
  total: number
): 'analyzing' | 'planning' | 'generating' | 'styling' | 'refining' | 'finalizing' {
  const phases: Array<
    'analyzing' | 'planning' | 'generating' | 'styling' | 'refining' | 'finalizing'
  > = [
    'analyzing',
    'analyzing',
    'planning',
    'planning',
    'generating',
    'generating',
    'generating',
    'styling',
    'styling',
    'refining',
    'refining',
    'finalizing',
  ];

  return phases[Math.min(index, phases.length - 1)];
}
