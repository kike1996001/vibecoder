import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface OptimizedPromptDisplayProps {
  optimized: string;
  improvements: string[];
  isVisible: boolean;
}

export function OptimizedPromptDisplay({
  optimized,
  improvements,
  isVisible
}: OptimizedPromptDisplayProps) {
  if (!isVisible || improvements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mt-4 p-4 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-violet-300">
          ✨ Optimized Prompt
        </h3>
      </div>

      {/* Optimized prompt text */}
      <div className="text-sm text-zinc-300 leading-relaxed bg-black/30 rounded-lg p-3 border border-white/[0.05]">
        {optimized}
      </div>

      {/* Improvements list */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Improvements
        </p>
        <div className="space-y-1.5">
          {improvements.map((improvement, index) => (
            <motion.div
              key={improvement}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 text-xs text-zinc-400"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500/60 shrink-0 mt-0.5" />
              <span>{improvement}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
