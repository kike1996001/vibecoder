import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Send,
  ChevronDown,
  Zap,
  Database,
  Globe,
  Atom,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProviderSelector } from "@/components/ui/ProviderSelector";
import { DesignQuestions } from "@/components/chat/DesignQuestions";
import { useAuth } from "@/hooks/useAuth";
import { getComplexity } from "@/services/complexityDetector";
import { DesignAnswers, formatDesignAnswersForPrompt } from "@/services/designQuestionFlow";

const projectTypes: Array<{ icon: any; label: string; desc: string; template: 'landing' | 'saas' | 'ecommerce' | 'admin' }> = [
  { icon: Zap, label: "Landing Page", desc: "Marketing & conversion", template: "landing" },
  { icon: Database, label: "SaaS Dashboard", desc: "Business intelligence", template: "saas" },
  { icon: Globe, label: "eCommerce", desc: "Online store", template: "ecommerce" },
  { icon: Atom, label: "Admin Panel", desc: "Management system", template: "admin" },
];

const suggestions = [
  "Dashboard de analytics en tiempo real",
  "E-commerce con carrito y checkout",
  "CRM para gestión de clientes",
  "Portfolio interactivo con animaciones",
];

export function Home() {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedType, setSelectedType] = useState(projectTypes[0]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedTemplate, setSelectedTemplate] = useState<'landing' | 'saas' | 'ecommerce' | 'admin'>(projectTypes[0].template);
  const [appType, setAppType] = useState<'web' | 'mobile'>('web');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const userInitials = (user?.name || user?.email || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  // Adaptive workflow states
  const [showDesignQuestions, setShowDesignQuestions] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [designAnswers, setDesignAnswers] = useState<DesignAnswers | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    // TODO: Restore auth check after testing
    // Check authentication first
    // if (!isAuthenticated) {
    //   navigate("/auth", { state: { returnTo: "/workspace", pendingGeneration: true } });
    //   return;
    // }
    
    // Store pending prompt and detect complexity
    setPendingPrompt(prompt.trim());
    const complexity = getComplexity(prompt.trim());
    
    if (complexity === 'complex') {
      // Show design questions for complex apps
      setShowDesignQuestions(true);
    } else {
      // Go directly to workspace for simple apps
      proceedToGeneration(prompt.trim(), null);
    }
  };

  const handleDesignQuestionsSubmitted = (answers: DesignAnswers) => {
    setDesignAnswers(answers);
    setShowDesignQuestions(false);
    proceedToGeneration(pendingPrompt, answers);
  };

  const proceedToGeneration = (finalPrompt: string, answers: DesignAnswers | null) => {
    setIsGenerating(true);
    
    // Enhance prompt with design answers if available
    let enhancedPrompt = finalPrompt;
    if (answers) {
      const designEnhancements = formatDesignAnswersForPrompt(answers);
      enhancedPrompt = `${finalPrompt}\n\n${designEnhancements}`;
    }
    
    // Use URL query parameters for better reliability across reloads
    const params = new URLSearchParams({
      prompt: enhancedPrompt,
      provider: selectedProvider,
      template: selectedTemplate,
      appType: appType,
      designAnswers: JSON.stringify(answers || {})
    });
    
    console.log("[Home] Navigating to workspace with query params");
    navigate(`/workspace?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative bg-[#0a0a0f]">
      {/* Subtle background gradients - inspired by Lovable's elegant design */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient top-right - blue accent */}
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-500/[0.05] blur-[120px]" />
        {/* Soft gradient bottom-left - violet accent */}
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-500/[0.03] blur-[100px]" />
      </div>

      {/* Professional Header - Like Lovable */}
      <div className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col gap-0">
              <p className="text-sm font-semibold text-white">Vibecoder</p>
              <p className="text-[10px] text-white/50">AI Code Builder</p>
            </div>
          </div>

          {/* Right nav items */}
          <div className="flex items-center gap-3">
            <button className="text-[11px] text-white/60 hover:text-white/80 transition-colors">
              Docs
            </button>
            <button className="text-[11px] text-white/60 hover:text-white/80 transition-colors">
              Gallery
            </button>
            
            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  title={user.email}
                >
                  {userInitials}
                </motion.button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-[#151515]/95 backdrop-blur border border-white/[0.12] shadow-xl z-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-xs text-white/50">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        {user.name && <p className="text-xs text-white/60">{user.name}</p>}
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => navigate("/settings")}
                          className="w-full px-4 py-2 text-[11px] text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Settings
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/[0.06] mt-1 pt-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => navigate("/auth")}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/60 border border-white/[0.12] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all hover:text-white/80"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative flex-1 flex flex-col items-center justify-start px-6 pt-8 pb-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {showDesignQuestions ? (
              <motion.div
                key="design-questions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <DesignQuestions 
                  onAnswersSubmitted={handleDesignQuestionsSubmitted}
                  isLoading={isGenerating}
                />
              </motion.div>
            ) : (
              <motion.div
                key="main-interface"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full flex flex-col items-center gap-8"
              >
                {/* Hero Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-3 w-full"
                >
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Build apps with AI
                  </h1>
                  <p className="text-base text-white/60 max-w-2xl mx-auto">
                    Describe your idea, and Vibecoder generates a fully functional app with design and code. 
                    Sign in to start building instantly.
                  </p>
                </motion.div>

                {/* Main Chat Input Card - Professional design like Lovable */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative w-full"
                >
                  <div
                    className={cn(
                      "rounded-xl border bg-[#131318]/70 backdrop-blur-md transition-all duration-300 overflow-hidden",
                      isFocused
                        ? "border-blue-500/30 shadow-lg shadow-blue-500/10"
                        : "border-white/[0.10] shadow-lg shadow-black/30"
                    )}
                  >
                    {/* Input area */}
                    <div className="p-4 space-y-3">
                      {/* Top row: Platform and Template selector */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">Platform:</span>
                          <div className="flex items-center gap-1 rounded-lg border border-white/[0.12] bg-white/[0.04] p-0.5">
                            <button
                              onClick={() => setAppType('web')}
                              className={cn(
                                "px-2.5 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                                appType === 'web'
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "text-white/50 hover:text-white/70"
                              )}
                            >
                              Web
                            </button>
                            <button
                              onClick={() => setAppType('mobile')}
                              className={cn(
                                "px-2.5 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                                appType === 'mobile'
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "text-white/50 hover:text-white/70"
                              )}
                            >
                              Mobile
                            </button>
                          </div>
                        </div>

                        {/* Template selector */}
                        <button
                          onClick={() => setShowTypeMenu(!showTypeMenu)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-white/60 hover:border-white/[0.18] hover:bg-white/[0.06] transition-colors"
                        >
                          <selectedType.icon className="h-3 w-3 text-blue-400" />
                          <span>{selectedType.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-2.5 w-2.5 text-white/40 transition-transform",
                              showTypeMenu && "rotate-180"
                            )}
                          />
                        </button>
                      </div>

                      {/* Main textarea area */}
                      <div className="flex items-end gap-3">
                        <div className="flex-1 min-w-0">
                          <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Describe your app idea..."
                            className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none min-h-[80px] max-h-[150px] leading-6"
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
                            "flex items-center justify-center w-10 h-10 rounded-lg transition-all shrink-0",
                            prompt.trim()
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                              : "bg-white/[0.06] text-white/40 cursor-not-allowed"
                          )}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom bar - Provider selector */}
                    <div className="px-4 pb-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">Provider:</span>
                        <ProviderSelector 
                          value={selectedProvider} 
                          onChange={setSelectedProvider}
                          compact 
                        />
                      </div>

                      <div className="text-[10px] text-white/40">
                        Press <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/60">Shift + Enter</kbd> for new line
                      </div>
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
                        className="absolute right-0 top-full mt-2 z-20 w-[280px] rounded-lg border border-white/[0.12] bg-[#151515]/95 backdrop-blur-md p-2 shadow-xl"
                      >
                        <div className="space-y-1">
                          {projectTypes.map((type) => (
                            <button
                              key={type.label}
                              onClick={() => {
                                setSelectedType(type);
                                setSelectedTemplate(type.template);
                                setShowTypeMenu(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] transition-all",
                                selectedType.label === type.label
                                  ? "border-blue-500/30 bg-blue-500/10"
                                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                              )}
                            >
                              <type.icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                              <div>
                                <p className="font-medium text-white">{type.label}</p>
                                <p className="text-white/40">{type.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Suggestions section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full space-y-3"
                >
                  <p className="text-[11px] text-white/40 uppercase tracking-wider">Try these examples:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestions.map((item) => (
                      <motion.button
                        key={item}
                        onClick={() => setPrompt(item)}
                        whileHover={{ y: -1 }}
                        className="px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-[11px] text-white/70 text-left"
                      >
                        {item}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
