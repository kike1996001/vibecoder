import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  Plus,
  Download,
  Settings,
  Globe,
  GitBranch,
  Loader2,
  Eye,
  Layout,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface WorkspaceTopBarProps {
  projectName?: string;
  previewMode: 'preview' | 'canvas' | 'code';
  setPreviewMode: (mode: 'preview' | 'canvas' | 'code') => void;
  isGenerating?: boolean;
  generationProgress?: number;
  generationStatus?: string;
  onNewProject?: () => void;
  onDownload?: () => void;
  onRefresh?: () => void;
}

export function WorkspaceTopBar({
  projectName = 'Untitled',
  previewMode,
  setPreviewMode,
  isGenerating = false,
  generationProgress = 0,
  generationStatus = '',
  onNewProject,
  onDownload,
  onRefresh,
}: WorkspaceTopBarProps) {
  const [showDeployMenu, setShowDeployMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-14 bg-[#050508] border-b border-white/[0.06] flex items-center justify-between px-5 shrink-0"
    >
      {/* LEFT SECTION - Workshop, Project, New */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        {/* Logo & Workshop */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">Workshop</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/[0.08] shrink-0" />

        {/* Project Selector */}
        <button className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors px-2 py-1 rounded-md hover:bg-white/[0.04] shrink-0">
          <span className="truncate max-w-[140px]">{projectName}</span>
          <ChevronDown size={14} className="text-white/40 shrink-0" />
        </button>

        {/* New Project Button */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium transition-all border border-white/[0.08] shrink-0"
          title="New Project"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* FLEX SPACER */}
      <div className="flex-1" />

      {/* CENTER SECTION - Preview/Canvas/Code Tabs */}
      <div className="flex items-center bg-white/[0.04] rounded-lg p-1 border border-white/[0.08] shrink-0">
        {(['preview', 'canvas', 'code'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              previewMode === mode
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            {mode === 'preview' && <Eye size={14} />}
            {mode === 'canvas' && <Layout size={14} />}
            {mode === 'code' && <Code2 size={14} />}
            <span className="capitalize hidden sm:inline">{mode}</span>
          </button>
        ))}
      </div>

      {/* FLEX SPACER */}
      <div className="flex-1" />

      {/* RIGHT SECTION - Status + Deploy + Download + Settings */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status and Generation Info */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20"
          >
            <Loader2 size={13} className="text-violet-400 animate-spin" />
            <span className="text-violet-300 text-xs font-medium">{generationStatus || 'Generating...'}</span>
            <div className="text-violet-400 text-xs">{generationProgress}%</div>
          </motion.div>
        )}

        {/* Deploy Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDeployMenu(!showDeployMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Globe size={13} />
            Deploy
          </button>

          <AnimatePresence>
            {showDeployMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#0f0f14] border border-white/10 rounded-lg shadow-xl p-1 z-50"
              >
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/[0.06] transition-all text-xs">
                  <span className="text-xs font-bold">▲</span> Vercel
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/[0.06] transition-all text-xs">
                  <span className="text-xs font-bold text-[#00C7B7]">N</span> Netlify
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/[0.06] transition-all text-xs">
                  <GitBranch size={13} /> GitHub Pages
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Download Button */}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all border border-white/10"
            title="Download project"
          >
            <Download size={13} />
            <span className="hidden md:block">Download</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </motion.div>
  );
}
