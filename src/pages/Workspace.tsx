import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { PreviewFrame } from '@/components/editor/PreviewFrame';
import { FileExplorer } from '@/components/editor/FileExplorer';
import { WorkspaceTopBar } from '@/components/layout/WorkspaceTopBar';
import { PreviewCarousel } from '@/components/editor/PreviewCarousel';
import { StreamingAnimation, AdvancedStatusBar } from '@/components/editor/StreamingAnimation';
import { webcontainerService } from '@/services/webcontainerService';

type PreviewMode = 'preview' | 'canvas' | 'code';

export function Workspace() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
    // Read from URL query parameters (most reliable method)
    const prompt = searchParams.get('prompt');
    const prov = searchParams.get('provider');
    const tmpl = searchParams.get('template');
    const appT = searchParams.get('appType');
    const designAns = searchParams.get('designAnswers');
    
    if (prompt) {
      setInitialPrompt(prompt);
      console.log('[Workspace] Got prompt from URL query params:', prompt.substring(0, 50) + '...');
    }
    if (prov) {
      setProvider(prov);
    }
    if (tmpl && ['landing', 'saas', 'ecommerce', 'admin'].includes(tmpl)) {
      setTemplate(tmpl as any);
    }
    if (appT && ['web', 'mobile'].includes(appT)) {
      setAppType(appT as any);
    }
    if (designAns) {
      try {
        const parsed = JSON.parse(designAns);
        setDesignAnswers(parsed);
      } catch (e) {
        console.warn('Failed to parse design answers:', e);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const boot = async () => {
      try {
        console.log('[Workspace] Booting WebContainer...');
        await Promise.race([
          webcontainerService.boot(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Boot timeout')), 35000)),
        ]);
        console.log('[Workspace] WebContainer ready');
      } catch (error) {
        console.warn('[Workspace] WebContainer boot error (will continue without preview):', error);
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
            width: isGenerating ? "50%" : chatExpanded ? "420px" : "44px",
            minWidth: isGenerating ? "50%" : chatExpanded ? "420px" : "44px",
            flexBasis: isGenerating ? "50%" : chatExpanded ? "420px" : "44px"
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
            {isGenerating ? (
              // Show carousel during generation
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#0b0b11] to-[#0a0a0f] p-4"
              >
                <div className="flex-1 min-h-0">
                  <PreviewCarousel
                    isGenerating={isGenerating}
                    currentProgress={generationProgress}
                    autoPlay={true}
                  />
                </div>
                
                {/* Streaming animation overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5"
                >
                  <AdvancedStatusBar
                    status={generationStatus || 'Generating your app...'}
                    progress={generationProgress}
                    isGenerating={true}
                  />
                </motion.div>
              </motion.div>
            ) : previewMode === 'preview' && (
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
