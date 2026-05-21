import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProviderSelectorProps {
  value: string;
  onChange: (provider: string) => void;
  compact?: boolean;
}

const providerInfo = {
  anthropic: {
    label: 'Claude',
    icon: '🧠',
    description: 'Best quality, slower, more expensive',
    color: 'from-violet-500 to-purple-500',
  },
  gemini: {
    label: 'Gemini',
    icon: '✨',
    description: 'Fast, good quality, balanced',
    color: 'from-blue-500 to-cyan-500',
  },
  llama: {
    label: 'Llama 2',
    icon: '🦙',
    description: 'Open source, economical',
    color: 'from-orange-500 to-red-500',
  },
  openai: {
    label: 'GPT-4',
    icon: '⚡',
    description: 'Enterprise grade',
    color: 'from-emerald-500 to-teal-500',
  },
};

type ProviderKey = keyof typeof providerInfo;

export function ProviderSelector({ value, onChange, compact }: ProviderSelectorProps) {
  const [available, setAvailable] = useState<string[]>(['anthropic']);

  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        setAvailable(data.available || ['anthropic']);
        if (!data.available.includes(value)) {
          onChange(data.available[0] || 'anthropic');
        }
      })
      .catch(() => setAvailable(['anthropic']));
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/50">Provider:</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-xs focus:outline-none focus:border-violet-500/50"
        >
          {available.map((provider) => (
            <option key={provider} value={provider}>
              {providerInfo[provider as ProviderKey]?.label || provider}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/50 uppercase tracking-wider">AI Provider</p>
      <div className="grid grid-cols-2 gap-2">
        {available.map((provider) => {
          const info = providerInfo[provider as ProviderKey];
          const isSelected = value === provider;

          return (
            <motion.button
              key={provider}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(provider)}
              className={cn(
                'p-3 rounded-xl border transition-all duration-200',
                isSelected
                  ? `border-violet-500/50 bg-gradient-to-br ${info.color} bg-opacity-10`
                  : 'border-white/[0.12] bg-white/[0.04] hover:border-white/[0.2]'
              )}
            >
              <div className="text-2xl mb-2">{info.icon}</div>
              <p className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-white/70')}>
                {info.label}
              </p>
              <p className="text-[10px] text-white/40 mt-1">{info.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
