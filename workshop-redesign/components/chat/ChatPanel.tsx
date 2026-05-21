import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  Code2, 
  Wand2,
  Zap,
  Globe,
  Image as ImageIcon,
  ChevronDown,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/hooks/useAppState';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

type LLMProvider = 'anthropic' | 'openai' | 'gemini' | 'github';

const providers = [
  { value: 'anthropic' as LLMProvider, label: 'Claude', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { value: 'openai' as LLMProvider, label: 'GPT-4', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'gemini' as LLMProvider, label: 'Gemini', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'github' as LLMProvider, label: 'Copilot', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const suggestions = [
  { icon: Zap, text: 'Dashboard de analytics con gráficos' },
  { icon: Globe, text: 'Landing page para clínica dental' },
  { icon: Code2, text: 'CRM con tabla de clientes' },
  { icon: ImageIcon, text: 'Portfolio con animaciones 3D' },
];

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: '👋 ¡Hola! Soy tu AI Builder. Describe la app que quieres crear y la generaré completa con código, diseño y funcionalidad.',
      timestamp: Date.now(),
    },
  ]);
  const [provider, setProvider] = useState<LLMProvider>('anthropic');
  const [showProviders, setShowProviders] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isGenerating } = useAppState();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const simulateResponse = async (userPrompt: string) => {
    setIsLoading(true);
    setStreamingText('');
    
    const response = `🚀 Estoy generando tu app basada en: "${userPrompt}"\n\n✅ Analizando requisitos\n✅ Generando estructura de archivos\n✅ Creando componentes React\n✅ Configurando estilos con Tailwind\n\n¡Tu app estará lista en unos segundos!`;
    
    let i = 0;
    const streamInterval = setInterval(() => {
      if (i < response.length) {
        setStreamingText((prev) => prev + response[i]);
        i++;
      } else {
        clearInterval(streamInterval);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
          },
        ]);
        setStreamingText('');
        setIsLoading(false);
      }
    }, 15);
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    await simulateResponse(input.trim());
  };

  const getMessageStyle = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-primary/90 text-white ml-auto rounded-2xl rounded-tr-sm';
      case 'assistant':
        return 'bg-surface-elevated border border-white/[0.06] text-foreground mr-auto rounded-2xl rounded-tl-sm';
      case 'system':
        return 'bg-amber-500/[0.08] border border-amber-500/20 text-amber-200 mx-auto rounded-2xl';
      default:
        return '';
    }
  };

  const getAvatarStyle = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-white/10 text-white';
      case 'assistant':
        return 'bg-primary/15 text-primary';
      case 'system':
        return 'bg-amber-500/15 text-amber-400';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a0a0c] border-r border-white/5 overflow-hidden">
      <div className="h-12 flex items-center px-4 border-b border-white/5 shrink-0 bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Builder</h3>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              )} />
              <span className="text-[10px] text-muted-foreground">{isLoading ? 'Generando...' : 'Online'}</span>
            </div>
          </div>
        </div>

        <div className="ml-auto relative">
          <button
            onClick={() => setShowProviders(!showProviders)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
              providers.find((p) => p.value === provider)?.bg,
              providers.find((p) => p.value === provider)?.color,
              "border-white/[0.08] hover:border-white/[0.15]"
            )}
          >
            {providers.find((p) => p.value === provider)?.label}
            <ChevronDown className={cn("h-3 w-3 transition-transform", showProviders && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showProviders && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute top-full right-0 mt-1 w-40 rounded-xl bg-surface-elevated border border-white/10 shadow-2xl z-50 overflow-hidden"
              >
                {providers.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setProvider(p.value);
                      setShowProviders(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/[0.04] transition-colors",
                      provider === p.value && "bg-white/[0.04]"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", p.bg.replace('/10', ''))} />
                    <span className={cn("font-medium", p.color)}>{p.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', getAvatarStyle(message.role))}>
                {message.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> :
                 message.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Wand2 className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('max-w-[90%] px-4 py-3 text-sm leading-relaxed', getMessageStyle(message.role))}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className={cn("flex items-center gap-1 mt-1", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="p-1 rounded hover:bg-white/[0.04] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    {copiedId === message.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <span className="text-[10px] text-muted-foreground/30">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {streamingText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              </div>
              <div className="bg-surface-elevated border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground max-w-[90%]">
                <p className="whitespace-pre-wrap">{streamingText}</p>
                <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
              </div>
            </motion.div>
          )}

          {isLoading && !streamingText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 pl-10"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <div className="space-y-2">
                <div className="h-2 w-32 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-2 w-20 bg-white/[0.05] rounded animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />

        {!isLoading && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3"
          >
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Sugerencias rápidas</p>
            <div className="grid grid-cols-1 gap-1.5">
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                    whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    onClick={() => setInput(suggestion.text)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm text-muted-foreground hover:text-foreground transition-all border border-white/[0.05] text-left"
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{suggestion.text}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 shrink-0 bg-surface/30">
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#111113] focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isGenerating ? 'Espera a que termine...' : 'Describe tu app aquí...'}
            className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/40 bg-white/[0.04] px-2 py-0.5 rounded">Shift + Enter nueva línea</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || isGenerating}
              className={cn(
                'h-8 w-8 p-0 rounded-xl flex items-center justify-center transition-all',
                input.trim() && !isLoading && !isGenerating
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                  : 'bg-white/[0.05] text-muted-foreground cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
