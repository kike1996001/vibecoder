import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Check } from 'lucide-react';
import {
  ColorPaletteOption,
  DesignAnswers,
  DesignMockup,
  DesignQuestion,
  LayoutOption,
  TypographyOption,
  getQuestionConfig,
  getNextQuestion,
  areAllQuestionsAnswered,
} from '@/services/designQuestionFlow';

interface DesignQuestionsProps {
  onAnswersSubmitted: (answers: DesignAnswers) => void;
  isLoading?: boolean;
}

export function DesignQuestions({ onAnswersSubmitted, isLoading = false }: DesignQuestionsProps) {
  const [answers, setAnswers] = useState<DesignAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState<DesignQuestion>('colorPalette');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const answeredQuestions = Object.keys(answers).filter(
    (key) => answers[key as keyof DesignAnswers] !== undefined
  ) as DesignQuestion[];

  const progress = (answeredQuestions.length / 4) * 100;

  const handleAnswer = (answer: any) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAnswers({
        ...answers,
        [currentQuestion]: answer,
      });

      const nextQuestion = getNextQuestion([...answeredQuestions, currentQuestion]);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (areAllQuestionsAnswered(answers)) {
      onAnswersSubmitted(answers);
    }
  };

  const canSubmit = areAllQuestionsAnswered(answers);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Design Setup</h3>
          <span className="text-xs text-gray-500">{answeredQuestions.length} of 4</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <QuestionRenderer
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion]}
            isTransitioning={isTransitioning}
            answeredCount={answeredQuestions.length}
          />
        </motion.div>
      </AnimatePresence>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: canSubmit ? 1 : 0.5, y: 0 }}
        className="mt-8 flex justify-end"
      >
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          size="lg"
        >
          {canSubmit ? (
            <>
              Generate with Design <ChevronRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            'Complete all questions first'
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

interface QuestionRendererProps {
  question: DesignQuestion;
  onAnswer: (answer: any) => void;
  currentAnswer?: any;
  isTransitioning: boolean;
  answeredCount: number;
}

function QuestionRenderer({
  question,
  onAnswer,
  currentAnswer,
  isTransitioning,
  answeredCount,
}: QuestionRendererProps) {
  const config = getQuestionConfig(question);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h2>
        <p className="text-gray-600">{config.description}</p>
      </motion.div>

      {config.type === 'visual-selection' && (
        <ColorPaletteGrid
          options={config.options as ColorPaletteOption[]}
          selected={currentAnswer}
          onSelect={onAnswer}
          isTransitioning={isTransitioning}
        />
      )}

      {config.type === 'option-selection' && (
        <TypographyGrid
          options={config.options as TypographyOption[]}
          selected={currentAnswer}
          onSelect={onAnswer}
          isTransitioning={isTransitioning}
        />
      )}

      {config.type === 'mockup-selection' && (
        <MockupGrid
          options={config.options as DesignMockup[]}
          selected={currentAnswer}
          onSelect={onAnswer}
          isTransitioning={isTransitioning}
        />
      )}
    </div>
  );
}

interface ColorPaletteGridProps {
  options: ColorPaletteOption[];
  selected?: ColorPaletteOption;
  onSelect: (option: ColorPaletteOption) => void;
  isTransitioning: boolean;
}

function ColorPaletteGrid({
  options,
  selected,
  onSelect,
  isTransitioning,
}: ColorPaletteGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option, idx) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card
            onClick={() => !isTransitioning && onSelect(option)}
            className={`p-4 cursor-pointer transition-all ${
              selected?.id === option.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-lg'
            } ${isTransitioning ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              {selected?.id === option.id && (
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
              )}
            </div>

            {/* Color Preview */}
            <div className="flex gap-2 mb-2">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: option.primary }}
              />
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: option.secondary }}
              />
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: option.accent }}
              />
            </div>

            <p className="text-xs text-gray-500">{option.example}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface TypographyGridProps {
  options: TypographyOption[];
  selected?: TypographyOption;
  onSelect: (option: TypographyOption) => void;
  isTransitioning: boolean;
}

function TypographyGrid({
  options,
  selected,
  onSelect,
  isTransitioning,
}: TypographyGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option, idx) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card
            onClick={() => !isTransitioning && onSelect(option)}
            className={`p-4 cursor-pointer transition-all ${
              selected?.id === option.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-lg'
            } ${isTransitioning ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              {selected?.id === option.id && (
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
              )}
            </div>

            {/* Typography Preview */}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Headings</p>
                <p className="text-lg font-bold" style={{ fontFamily: option.heading }}>
                  {option.heading}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Body</p>
                <p style={{ fontFamily: option.body }}>
                  {option.body}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">{option.vibe}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface MockupGridProps {
  options: DesignMockup[];
  selected?: DesignMockup;
  onSelect: (option: DesignMockup) => void;
  isTransitioning: boolean;
}

function MockupGrid({
  options,
  selected,
  onSelect,
  isTransitioning,
}: MockupGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {options.map((option, idx) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card
            onClick={() => !isTransitioning && onSelect(option)}
            className={`p-4 cursor-pointer transition-all ${
              selected?.id === option.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-lg'
            } ${isTransitioning ? 'pointer-events-none opacity-50' : ''}`}
          >
            {/* Mockup Preview */}
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400 mb-2">📱</p>
                <p className="text-xs text-gray-500">{option.layout}</p>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{option.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                <p className="text-xs text-gray-500">{option.vibe}</p>
              </div>
              {selected?.id === option.id && (
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
