import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Send,
  Atom,
  ChevronDown,
  Plus,
  ChevronRight,
  CornerDownLeft,
  Zap,
  Globe,
  Image,
  Database,
  Wand2,
  Keyboard,
  Paperclip,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProviderSelector } from "@/components/ui/ProviderSelector";
import { SmartPromptWizard } from "@/components/wizard/SmartPromptWizard";

const projectTypes: Array<{ icon: any; label: string; desc: string; template: 'landing' | 'saas' | 'ecommerce' | 'admin' }> = [
  { icon: Zap, label: "Landing Page", desc: "Marketing & conversion", template: "landing" },
  { icon: Database, label: "SaaS Dashboard", desc: "Business intelligence", template: "saas" },
  { icon: Globe, label: "eCommerce", desc: "Online store", template: "ecommerce" },
  { icon: Atom, label: "Admin Panel", desc: "Management system", template: "admin" },
];

const suggestions = [
  "Crea un dashboard de analytics con graficos en tiempo real",
  "Genera una app de e-commerce con carrito y checkout",
  "Construye un CRM para gestion de clientes",
  "Disena un portfolio interactivo con animaciones 3D",
];

export function Home() {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedType, setSelectedType] = useState(projectTypes[0]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("anthropic");
  const [selectedTemplate, setSelectedTemplate] = useState<'landing' | 'saas' | 'ecommerce' | 'admin'>(projectTypes[0].template);
  const [appType, setAppType] = useState<'web' | 'mobile'>('web');
  const [displayText, setDisplayText] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();

  // Typewriter effect
  useEffect(() => {
    const text = "What should we work on today?";
    let i = 0;
    const interval = window.setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        window.clearInterval(interval);
      }
    }, 40);
    return () => window.clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    try {
      window.localStorage.setItem("workshop_pending_prompt", prompt.trim());
      window.localStorage.setItem("workshop_provider", selectedProvider);
      window.localStorage.setItem("workshop_template", selectedTemplate);
      window.localStorage.setItem("workshop_appType", appType);
    } catch (e) {}
    navigate("/workspace");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background grid - subtle like the image */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 space-y-3 flex flex-col items-center">
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-0.5"
        >
          <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white">
            {displayText}
            <span className="inline-block w-[3px] h-[1em] bg-violet-400 ml-1 animate-pulse" />
          </h1>
          <p className="text-[12px] text-zinc-500 leading-tight">
            Chat with the agent to research, analyze, and build data apps
          </p>
        </motion.div>

        {/* Main Chat Input Card - As seen in the image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative w-full"
        >
          <div
            className={cn(
              "rounded-2xl border bg-[#111111]/90 backdrop-blur-xl transition-all duration-300 overflow-hidden min-h-[160px]",
              isFocused
                ? "border-violet-500/20 shadow-2xl shadow-violet-500/5"
                : "border-white/[0.06] shadow-xl shadow-black/20"
            )}
          >
            {/* Top area with + button, type selector, and textarea */}
            <div className="p-4 pb-2">
              {/* Web/Mobile toggle */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Platform:</span>
                <div className="flex items-center gap-1 rounded-lg border border-white/[0.12] bg-white/[0.04] p-0.5">
                  <button
                    onClick={() => setAppType('web')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors",
                      appType === 'web'
                        ? "bg-violet-500/20 text-violet-300"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Web
                  </button>
                  <button
                    onClick={() => setAppType('mobile')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors",
                      appType === 'mobile'
                        ? "bg-violet-500/20 text-violet-300"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Mobile
                  </button>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                {/* Plus button */}
                <button
                  onClick={() => setShowTypeMenu(!showTypeMenu)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] transition-all shrink-0 mt-0.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>

                <div className="flex-1 min-w-0">
                  {/* Type selector pill */}
                  <button
                    onClick={() => setShowTypeMenu(!showTypeMenu)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-400 hover:border-white/[0.14] transition-colors mb-1.5"
                  >
                    <Atom className="h-3 w-3 text-violet-400" />
                    <span>{selectedType.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-2.5 w-2.5 text-zinc-600 transition-transform",
                        showTypeMenu && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Type @ or click + to include data."
                    className="w-full resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none min-h-[100px] max-h-[180px] leading-6"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl transition-all shrink-0 mt-0.5",
                    prompt.trim()
                      ? "bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "bg-white/[0.06] text-zinc-600 cursor-not-allowed"
                  )}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom bar with Gemini indicator and tools */}
            <div className="px-3 pb-2 pt-0.5 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Tool icons row */}
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Zap className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Globe className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Image className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Database className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Wand2 className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Keyboard className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <CornerDownLeft className="h-3 w-3" />
                </button>
                <button className="p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all">
                  <Paperclip className="h-3 w-3" />
                </button>
              </div>

              {/* Gemini indicator */}
              <ProviderSelector 
                value={selectedProvider} 
                onChange={setSelectedProvider}
                compact 
              />
            </div>
          </div>

          {/* Type Menu Dropdown */}
          <AnimatePresence>
            {showTypeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 top-20 z-20 w-[360px] rounded-2xl border border-white/[0.08] bg-[#151515]/95 backdrop-blur-xl p-3 shadow-2xl"
              >
                <div className="grid grid-cols-2 gap-2">
                  {projectTypes.map((type) => (
                    <button
                      key={type.label}
                      onClick={() => {
                        setSelectedType(type);
                        setSelectedTemplate(type.template);
                        setShowTypeMenu(false);
                      }}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-left hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                    >
                      <type.icon className="h-4 w-4 text-violet-400" />
                      <div>
                        <p className="text-[13px] font-medium text-zinc-200">
                          {type.label}
                        </p>
                        <p className="text-[11px] text-zinc-600">{type.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Suggestions pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-1"
        >
          {suggestions.map((item) => (
            <motion.button
              key={item}
              onClick={() => setPrompt(item)}
              whileHover={{ y: -1 }}
              className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12] hover:bg-white/[0.06] transition-all"
            >
              <ChevronRight className="h-2.5 w-2.5 text-orange-400/70" />
              {item}
            </motion.button>
          ))}
        </motion.div>

        {/* Jump back in section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center pt-1"
        >
          <div className="flex items-center gap-2.5 text-[12px]">
            <CornerDownLeft className="h-3 w-3 text-zinc-600" />
            <span className="text-zinc-600">Jump back in</span>
            <span className="text-zinc-700">|</span>
            <button className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors">
              <span>Portfolio showcase</span>
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>
        </motion.div>

        {/* Promotional card - Free Gemini AI Credits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex justify-center pt-0.5"
        >
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 cursor-pointer hover:border-white/[0.1] hover:bg-white/[0.04] transition-all max-w-md"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 shrink-0">
              <Sparkles className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-zinc-200">
                Free Gemini AI Credits
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                Up to $200 in credits for your apps
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Dot pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-1 pt-1"
        >
          <span className="w-1 h-1 rounded-full bg-zinc-500" />
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
        </motion.div>

        {/* Smart Wizard Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWizard(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all"
        >
          <Wand2 className="h-4 w-4" />
          <span className="text-sm font-medium">Smart Builder</span>
        </motion.button>
      </div>

      {/* Smart Prompt Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <SmartPromptWizard
            onComplete={(data, generatedPrompt) => {
              setPrompt(generatedPrompt);
              setShowWizard(false);
              // Auto scroll to prompt input
              setTimeout(() => textareaRef.current?.focus(), 100);
            }}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
