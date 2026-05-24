import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language, getLanguageName } from '@/services/statusMessageI18n';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  compact?: boolean;
}

/**
 * Language Selector Component
 * Allows users to switch between Spanish, English, and Portuguese
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const languages: Language[] = ['es', 'en', 'pt'];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors ${
          compact ? 'text-[10px]' : 'text-xs'
        } text-white/60 hover:text-white/80`}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-3.5 h-3.5" />
        {!compact && <span className="hidden sm:inline">{getLanguageName(currentLanguage)}</span>}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-white/[0.12] bg-[#0a0a0f]/95 backdrop-blur-sm shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {languages.map((lang, index) => (
                <motion.button
                  key={lang}
                  onClick={() => {
                    onLanguageChange(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    currentLanguage === lang
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span>{getLanguageName(lang)}</span>
                  {currentLanguage === lang && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
