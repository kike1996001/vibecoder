import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Loader2,
  Code2,
  Zap,
  Globe,
  Image as ImageIcon,
  Terminal,
  ChevronDown,
  PanelLeft,
  Maximize2,
  Plus,
  Paperclip,
  Wand2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProviderSelector } from '@/components/ui/ProviderSelector';
import { useAppGeneration } from '@/hooks/useAppGeneration';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface TerminalLog {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'command';
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  initialPrompt?: string | null;
  compact?: boolean;
  onGeneratingChange?: (isGenerating: boolean) => void;
  onProgressChange?: (progress: number) => void;
  onStatusChange?: (status: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  provider?: string;
  template?: 'landing' | 'saas' | 'ecommerce' | 'admin';
  appType?: 'web' | 'mobile';
}

const suggestions = [
  { icon: Zap, text: 'Dashboard de analytics con gráficos' },
  { icon: Globe, text: 'Landing page para clínica dental' },
  { icon: Code2, text: 'CRM con tabla de clientes' },
  { icon: ImageIcon, text: 'Portfolio con animaciones 3D' },
];

export function ChatPanel({
  initialPrompt,
  compact,
  onGeneratingChange,
  onProgressChange,
  onStatusChange,
  isExpanded = true,
  onToggleExpand,
  provider: initialProvider = 'anthropic',
  template = 'landing',
  appType = 'web',
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState(initialProvider);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Hola! Soy tu AI Builder. Describe la app que quieres crear y la generare completa con codigo y vista previa.',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: '1',
      type: 'info',
      message: 'Workshop AI Workspace v2.0 inicializado',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'success',
      message: 'Conectado al backend de generación',
      timestamp: new Date(),
    },
    {
      id: '3',
      type: 'info',
      message: 'Listo para generar tu website...',
      timestamp: new Date(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const { generateApp, refineApp, streamingText } = useAppGeneration();
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const projects = useProjectStore((state) => state.projects);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const isCompact = Boolean(compact);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streamingText]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const addLog = (message: string, type: TerminalLog['type'] = 'info') => {
    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const submitPrompt = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    onGeneratingChange?.(true);

    try {
      addLog(`Analizando request: "${text.slice(0, 50)}..."`, 'command');
      onStatusChange?.('Preparando generación...');
      onProgressChange?.(10);

      if (activeProject && activeProject.status === 'running') {
        addLog('Conectando con proyecto existente...', 'info');
        await refineApp(text, activeProject.id, { provider, template, appType });
        onProgressChange?.(50);

        addLog('Aplicando cambios...', 'info');
        onStatusChange?.('Refinando...');

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '✅ He actualizado la app con tus cambios. Revisa el preview para ver los resultados.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        addLog('Cambios aplicados exitosamente', 'success');
      } else {
        addLog('Generando nueva app...', 'info');
        await generateApp(text, { provider, template, appType });
        onProgressChange?.(75);

        onStatusChange?.('Finalizando...');
        addLog('App generada correctamente', 'success');

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `He generado tu app "${text.slice(0, 40)}...". Puedes ver el preview en el panel derecho y pedirme mas mejoras.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      onProgressChange?.(100);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'No se pudo generar';
      addLog(errorMsg, 'error');

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `❌ Error: ${errorMsg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      onGeneratingChange?.(false);
      onStatusChange?.('');
      onProgressChange?.(0);
    }
  };

  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      // Mostrar el prompt como mensaje del usuario
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: initialPrompt,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // Ejecutar después de un pequeño delay para que se vea el mensaje
      const t = window.setTimeout(() => submitPrompt(initialPrompt), 400);
      return () => window.clearTimeout(t);
    }
  }, [initialPrompt]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] shrink-0 overflow-hidden">
      {/* Header - Always Visible */}
      <div className={cn(
        "h-11 border-b border-white/[0.06] shrink-0 flex items-center justify-between transition-all duration-300 relative",
        isExpanded ? "px-4 py-3" : "px-2 py-2 justify-center"
      )}>
        <div className={cn(
          "flex items-center gap-2 min-w-0 overflow-hidden transition-all duration-300 flex-1",
          isExpanded ? "opacity-100" : "opacity-0 w-0"
        )}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium whitespace-nowrap">Agent Chat</p>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px]">
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
              Trabajando
            </span>
          )}
          
          {/* Provider selector button - Compact */}
          <div className="ml-auto flex items-center gap-2 relative">
            {/* Template badge */}
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/[0.12] bg-white/[0.04] text-[10px] text-white/60">
              <span className="capitalize font-medium">{template}</span>
            </span>
            
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-[10px] text-white/60 hover:text-white/80"
            >
              <span className="font-medium">Provider:</span>
              <span className="text-white/80 capitalize font-semibold">{provider}</span>
              <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", showProviderMenu && "rotate-180")} />
            </button>
            
            {/* Provider dropdown menu */}
            <AnimatePresence>
              {showProviderMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-10 right-0 z-50 w-40 rounded-xl border border-white/[0.12] bg-[#151515]/95 backdrop-blur-xl p-2 shadow-2xl"
                >
                  <ProviderSelector
                    value={provider}
                    onChange={(newProvider) => {
                      setProvider(newProvider);
                      setShowProviderMenu(false);
                    }}
                    compact={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          onClick={onToggleExpand}
          className={cn(
            "p-1.5 rounded-md hover:bg-white/[0.06] transition-colors flex-shrink-0",
            isExpanded ? "" : "mx-auto"
          )}
          title={isExpanded ? "Collapse chat" : "Expand chat"}
        >
          {isExpanded ? (
            <PanelLeft className="h-4 w-4 text-white/60 hover:text-white/100" />
          ) : (
            <Maximize2 className="h-4 w-4 text-white/60 hover:text-white/100" />
          )}
        </button>
      </div>

      {/* Content Container - Always rendered, visibility controlled by opacity */}
      <div className={cn(
        "flex-1 min-h-0 flex flex-col overflow-hidden transition-all duration-300",
        isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none hidden"
      )}>
        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full px-4 py-4">
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {message.role !== 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                          message.role === 'user'
                            ? 'bg-white/[0.08] text-white/90'
                            : 'bg-transparent text-white/80 border-b border-white/[0.06]'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {streamingText && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                      </div>
                      <div className="bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3 border border-white/[0.06] max-w-[85%]">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {isLoading && !streamingText && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 justify-start">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Redesigned with toolbar */}
          <div className="shrink-0 bg-[#0a0a0f] border-t border-white/[0.06]">
            <form onSubmit={(e) => { e.preventDefault(); submitPrompt(); }} className="p-3 space-y-2">
              {/* Main input box */}
              <div className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                input.trim()
                  ? "border-violet-500/40 bg-white/[0.06] shadow-lg shadow-violet-500/10"
                  : "border-white/[0.12] bg-white/[0.03]"
              )}>
                <div className="p-3 pb-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        submitPrompt();
                      }
                    }}
                    rows={1}
                    placeholder="Describe tu app..."
                    className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30 min-h-[40px] max-h-[100px] leading-5"
                  />
                </div>

                {/* Toolbar - bottom of input */}
                <div className="px-2.5 pb-2 flex items-center justify-between gap-1.5">
                  {/* Left side: Tool buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                      title="Upload image"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                      title="Attach file"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                      title="Magic wand"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Right side: Send button */}
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      input.trim()
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/30"
                        : "bg-white/[0.06] text-white/40 cursor-not-allowed"
                    )}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Helper text */}
              <p className="text-[9px] text-white/15 px-1 uppercase tracking-wider">⌨️ Enter para enviar</p>
            </form>
          </div>

      </div>

      {/* Terminal Area - Hidden when collapsed to icon-only */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] shrink-0">
          <button onClick={() => setShowTerminal(!showTerminal)} className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-white/40" />
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Terminal</span>
              {logs.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[9px] text-white/30">{logs.length}</span>}
            </div>
            <ChevronDown size={12} className={cn('text-white/30 transition-transform', showTerminal && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {showTerminal && (
              <motion.div initial={{ height: 0 }} animate={{ height: 160 }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="h-full bg-[#050508] px-4 py-2 overflow-y-auto font-mono text-[11px] space-y-1 border-t border-white/[0.06]">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className={cn('shrink-0', log.type === 'success' && 'text-emerald-400', log.type === 'error' && 'text-red-400', log.type === 'warning' && 'text-amber-400', log.type === 'command' && 'text-violet-400', log.type === 'info' && 'text-blue-400')}>
                        {log.type === 'command' ? '$' : '>'}
                      </span>
                      <span className={cn('text-white/60', log.type === 'success' && 'text-emerald-400/80', log.type === 'error' && 'text-red-400/80', log.type === 'warning' && 'text-amber-400/80')}>
                        {log.message}
                      </span>
                      <span className="text-white/20 ml-auto shrink-0 text-[9px]">
                        {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}


