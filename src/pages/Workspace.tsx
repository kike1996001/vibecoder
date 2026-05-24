import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { PreviewFrame } from '@/components/editor/PreviewFrame';
import { FileExplorer } from '@/components/editor/FileExplorer';
import { WorkspaceTopBar } from '@/components/layout/WorkspaceTopBar';
import { webcontainerService } from '@/services/webcontainerService';

type PreviewMode = 'preview' | 'canvas' | 'code';

export function Workspace() {
  const location = useLocation();
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('anthropic');
  const [template, setTemplate] = useState<'landing' | 'saas' | 'ecommerce' | 'admin'>('landing');
  const [appType, setAppType] = useState<'web' | 'mobile'>('web');
  const [designAnswers, setDesignAnswers] = useState<any>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [chatExpanded, setChatExpanded] = useState(true);
  const [fileExplorerCollapsed, setFileExplorerCollapsed] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    // First check location.state (from navigation)
    const state = location.state as { initialPrompt?: string } | null;
    if (state?.initialPrompt) {
      setInitialPrompt(state.initialPrompt);
      return;
    }
    
    // Then check localStorage (from Home page)
    try {
      const storedPrompt = window.localStorage.getItem('workshop_pending_prompt');
      const storedProvider = window.localStorage.getItem('workshop_provider');
      const storedTemplate = window.localStorage.getItem('workshop_template');
      const storedAppType = window.localStorage.getItem('workshop_appType');
      const storedDesignAnswers = window.localStorage.getItem('workshop_design_answers');
      
      if (storedPrompt) {
        setInitialPrompt(storedPrompt);
        // Clear it after reading
        window.localStorage.removeItem('workshop_pending_prompt');
      }
      if (storedProvider) {
        setProvider(storedProvider);
        window.localStorage.removeItem('workshop_provider');
      }
      if (storedTemplate && ['landing', 'saas', 'ecommerce', 'admin'].includes(storedTemplate)) {
        setTemplate(storedTemplate as any);
        window.localStorage.removeItem('workshop_template');
      }
      if (storedAppType && ['web', 'mobile'].includes(storedAppType)) {
        setAppType(storedAppType as any);
        window.localStorage.removeItem('workshop_appType');
      }
      if (storedDesignAnswers) {
        try {
          const parsed = JSON.parse(storedDesignAnswers);
          setDesignAnswers(parsed);
          window.localStorage.removeItem('workshop_design_answers');
        } catch (e) {
          console.warn('Failed to parse design answers:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to read pending prompt/provider/template/appType from localStorage:', e);
    }
  }, [location.state]);

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.race([
          webcontainerService.boot(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Boot timeout')), 15000)),
        ]);
      } catch (error) {
        console.warn('[Workspace] boot timeout', error);
      } finally {
        setIsBooting(false);
      }
    };
    boot();
  }, []);

  if (isBooting) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050508]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white/60 text-sm">Iniciando workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050508] text-white overflow-hidden fixed inset-0">
      {/* Top Bar - Sticky */}
      <div className="sticky top-0 z-40 shrink-0 border-b border-white/[0.06] bg-[#050508]">
        <WorkspaceTopBar
          projectName="Mi Proyecto"
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          generationStatus={generationStatus}
          onDownload={() => console.log('Download')}
          onRefresh={() => console.log('Refresh')}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden w-full">
        {/* Left Panel - Chat */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="shrink-0 border-r border-white/[0.06] bg-[#0a0a0f] flex flex-col min-h-0 overflow-hidden transition-all duration-300"
          style={{ 
            width: chatExpanded ? "420px" : "44px",
            minWidth: chatExpanded ? "420px" : "44px",
            flexBasis: chatExpanded ? "420px" : "44px"
          }}
        >
          <ChatPanel
            initialPrompt={initialPrompt}
            provider={provider}
            template={template}
            appType={appType}
            designAnswers={designAnswers}
            onGeneratingChange={setIsGenerating}
            onProgressChange={setGenerationProgress}
            onStatusChange={setGenerationStatus}
            isExpanded={chatExpanded}
            onToggleExpand={() => setChatExpanded(!chatExpanded)}
          />
        </motion.div>

        {/* Right Panel - Editor/Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex-1 flex flex-col min-h-0 bg-[#0b0b11] transition-all duration-200"
        >
          {/* Preview Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {previewMode === 'preview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PreviewFrame deviceView={deviceView} setDeviceView={setDeviceView} />
              </motion.div>
            )}

            {previewMode === 'canvas' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center text-white/40"
              >
                <div className="text-center">
                  <p className="text-sm">Canvas editor coming soon</p>
                </div>
              </motion.div>
            )}

            {previewMode === 'code' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full flex min-h-0 overflow-hidden"
              >
                <div className={cn(
                  "border-r border-white/[0.06] bg-[#0a0a0f] flex flex-col shrink-0 transition-all duration-300",
                  fileExplorerCollapsed ? "w-10" : "w-[260px]"
                )}>
                  <FileExplorer 
                    isCollapsed={fileExplorerCollapsed}
                    onToggleCollapse={() => setFileExplorerCollapsed(!fileExplorerCollapsed)}
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MonacoEditor />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
