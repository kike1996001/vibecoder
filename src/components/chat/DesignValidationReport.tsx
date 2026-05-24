import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Palette,
  Type,
  Layout,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { ValidationResult } from '@/services/designValidation';

interface DesignValidationReportProps {
  result: ValidationResult;
  isVisible: boolean;
}

export const DesignValidationReport: React.FC<DesignValidationReportProps> = ({
  result,
  isVisible,
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    colors: true,
    typography: true,
    layout: true,
    darkMode: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full max-w-3xl mx-auto mb-4 space-y-3"
    >
      {/* Overall Score Header */}
      <motion.div
        className="rounded-lg border border-white/[0.12] bg-white/[0.04] p-4 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white/90 mb-1">
              Design System Validation
            </h3>
            <p className="text-[11px] text-white/50">{result.summary}</p>
          </div>

          {/* Score Circle */}
          <div className="flex-shrink-0 relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/[0.06]"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * result.overallScore) / 100}
                className={`transition-all duration-1000 ${
                  result.overallScore >= 80
                    ? 'text-emerald-500'
                    : result.overallScore >= 60
                      ? 'text-yellow-500'
                      : 'text-red-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-lg font-bold ${
                  result.overallScore >= 80
                    ? 'text-emerald-500'
                    : result.overallScore >= 60
                      ? 'text-yellow-500'
                      : 'text-red-500'
                }`}
              >
                {result.overallScore}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Validation Sections */}
      <div className="space-y-2">
        {/* Colors Section */}
        <ValidateSection
          icon={Palette}
          title="Color Palette"
          isExpanded={expandedSections.colors}
          onToggle={() => toggleSection('colors')}
          delay={0.2}
        >
          <ColorValidationContent result={result.colorPalette} />
        </ValidateSection>

        {/* Typography Section */}
        <ValidateSection
          icon={Type}
          title="Typography"
          isExpanded={expandedSections.typography}
          onToggle={() => toggleSection('typography')}
          delay={0.25}
        >
          <TypographyValidationContent result={result.typography} />
        </ValidateSection>

        {/* Layout Section */}
        <ValidateSection
          icon={Layout}
          title="Layout Structure"
          isExpanded={expandedSections.layout}
          onToggle={() => toggleSection('layout')}
          delay={0.3}
        >
          <LayoutValidationContent result={result.layout} />
        </ValidateSection>

        {/* Dark Mode Section */}
        <ValidateSection
          icon={Moon}
          title="Dark Mode"
          isExpanded={expandedSections.darkMode}
          onToggle={() => toggleSection('darkMode')}
          delay={0.35}
        >
          <DarkModeValidationContent result={result.darkMode} />
        </ValidateSection>
      </div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`rounded-lg border p-3 text-center text-sm font-medium ${
          result.allValid
            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
            : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
        }`}
      >
        {result.allValid
          ? '✅ Todos los elementos del design system fueron correctamente aplicados'
          : '⚠️ Algunos elementos necesitan revisión'}
      </motion.div>
    </motion.div>
  );
};

/**
 * Reusable Validation Section Component
 */
interface ValidateSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
  children: React.ReactNode;
}

const ValidateSection: React.FC<ValidateSectionProps> = ({
  icon: Icon,
  title,
  isExpanded,
  onToggle,
  delay,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="rounded-lg border border-white/[0.12] bg-white/[0.02] overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.06] px-4 py-3 bg-white/[0.01]"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Color Validation Content
 */
const ColorValidationContent: React.FC<{ result: any }> = ({ result }) => {
  return (
    <div className="space-y-3 text-sm">
      {/* Coverage */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-white/60">Cobertura de Paleta</span>
          <span
            className={`font-semibold ${
              result.coverage >= 60 ? 'text-emerald-400' : 'text-yellow-400'
            }`}
          >
            {result.coverage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${result.coverage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Colors Used */}
      {result.used.length > 0 && (
        <div>
          <p className="text-white/60 mb-2">Colores Utilizados:</p>
          <div className="flex flex-wrap gap-2">
            {result.used.map((color: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.12]"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-white/60 font-mono">{color}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-1">
          {result.issues.map((issue: string, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-2 text-[11px] text-yellow-400/80"
            >
              <span>⚠️</span>
              <span>{issue}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 pt-2 text-[11px]">
        {result.valid ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-400">Validación exitosa</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400">Necesita revisión</span>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Typography Validation Content
 */
const TypographyValidationContent: React.FC<{ result: any }> = ({ result }) => {
  return (
    <div className="space-y-3 text-sm">
      {/* Selected vs Used */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-white/60 text-[11px] mb-1">Seleccionadas</p>
          <div className="space-y-1">
            {result.selected.map((font: string, idx: number) => (
              <div key={idx} className="text-[11px] text-white/80 px-2 py-1 rounded bg-white/[0.04]">
                {font}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white/60 text-[11px] mb-1">Utilizadas</p>
          <div className="space-y-1">
            {result.used.length > 0 ? (
              result.used.map((font: string, idx: number) => (
                <div
                  key={idx}
                  className="text-[11px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
                >
                  ✅ {font}
                </div>
              ))
            ) : (
              <div className="text-[11px] text-white/40 px-2 py-1">No detectadas</div>
            )}
          </div>
        </div>
      </div>

      {/* Hierarchy */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white/60">Jerarquía de Tamaños</span>
          {result.hierarchy ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <AlertCircle className="w-3 h-3 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-white/[0.06]">
          {result.issues.map((issue: string, idx: number) => (
            <div key={idx} className="flex gap-2 text-[11px] text-yellow-400/80">
              <span>⚠️</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Layout Validation Content
 */
const LayoutValidationContent: React.FC<{ result: any }> = ({ result }) => {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-white/60 text-[11px] mb-1">Seleccionado</p>
          <div className="text-[11px] text-white/80 px-2 py-1 rounded bg-white/[0.04]">
            {result.selectedType}
          </div>
        </div>
        <div>
          <p className="text-white/60 text-[11px] mb-1">Detectado</p>
          <div
            className={`text-[11px] px-2 py-1 rounded ${
              result.isValid
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-yellow-400 bg-yellow-500/10'
            }`}
          >
            {result.detectedType}
          </div>
        </div>
      </div>

      {/* Match Score */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-white/60">Compatibilidad</span>
          <span className="font-semibold text-white/80">{result.matchScore}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${result.matchScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Structure */}
      <div>
        <p className="text-white/60 text-[11px] mb-1">Estructura</p>
        <p className="text-[11px] text-white/60 px-2 py-1 rounded bg-white/[0.04]">
          {result.structure}
        </p>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-white/[0.06]">
          {result.issues.map((issue: string, idx: number) => (
            <div key={idx} className="flex gap-2 text-[11px] text-yellow-400/80">
              <span>⚠️</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Dark Mode Validation Content
 */
const DarkModeValidationContent: React.FC<{ result: any }> = ({ result }) => {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-white/60 text-[11px] mb-1">Seleccionado</p>
          <div className="text-[11px] px-2 py-1 rounded bg-white/[0.04] text-white/80">
            {result.selected ? '✅ Sí' : '❌ No'}
          </div>
        </div>
        <div>
          <p className="text-white/60 text-[11px] mb-1">Implementado</p>
          <div
            className={`text-[11px] px-2 py-1 rounded ${
              result.implemented ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}
          >
            {result.implemented ? '✅ Sí' : '❌ No'}
          </div>
        </div>
      </div>

      {/* Contrast */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white/60">Contraste WCAA AA</span>
          {result.contrastValid ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <AlertCircle className="w-3 h-3 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-white/[0.06]">
          {result.issues.map((issue: string, idx: number) => (
            <div key={idx} className="flex gap-2 text-[11px] text-yellow-400/80">
              <span>⚠️</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
