import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Check, Loader2, Sparkles } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';

interface InlineEditProps {
  filePath: string;
  selectedText: string;
  onApply: (newContent: string) => void;
  onClose: () => void;
}

export function AIInlineEdit({ filePath, selectedText, onApply, onClose }: InlineEditProps) {
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diff, setDiff] = useState<{ original: string; modified: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const project = useProjectStore.getState().projects.find(
        (p) => p.id === useProjectStore.getState().activeProjectId
      );
      
      const currentFile = project?.files.find((f) => f.path === filePath);
      
      const response = await fetch('/api/ai/inline-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: currentFile?.content,
          selectedText,
          instruction,
          filePath,
        }),
      });

      if (!response.ok) throw new Error('Inline edit API failed');

      const { modified } = await response.json();
      
      setDiff({
        original: selectedText,
        modified,
      });
    } catch (error) {
      console.error('Inline edit failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (diff) {
      onApply(diff.modified);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4 w-96"
    >
      {!diff ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4 text-orange-300" />
            <span>AI Edit</span>
          </div>
          
          <input
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe the change..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate();
            }}
            autoFocus
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30">
              {selectedText.length} chars selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!instruction.trim() || isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
                Generate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Review Changes</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-auto">
            <div className="text-xs text-red-400 font-mono bg-red-500/10 rounded-lg p-2">
              - {diff.original}
            </div>
            <div className="text-xs text-emerald-400 font-mono bg-emerald-500/10 rounded-lg p-2">
              + {diff.modified}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDiff(null)}
              className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
            >
              <Check className="h-3 w-3" />
              Apply
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
