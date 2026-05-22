import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Zap,
  Users,
  Palette,
  Code,
} from 'lucide-react';

interface PromptWizardData {
  step1: {
    projectName: string;
    description: string;
  };
  step2: {
    targetAudience: string;
    mainFeatures: string;
  };
  step3: {
    design: 'modern' | 'minimal' | 'corporate' | 'creative';
    colorScheme: 'blue' | 'purple' | 'green' | 'orange';
  };
  step4: {
    technologies: string[];
    integrations: string[];
  };
  step5: {
    additionalNotes: string;
    priority: 'fast' | 'quality' | 'balanced';
  };
}

interface SmartPromptWizardProps {
  onComplete: (data: PromptWizardData, generatedPrompt: string) => void;
  onCancel: () => void;
}

const STEP_ICONS = {
  1: <Sparkles className="w-5 h-5" />,
  2: <Users className="w-5 h-5" />,
  3: <Palette className="w-5 h-5" />,
  4: <Code className="w-5 h-5" />,
  5: <Zap className="w-5 h-5" />,
};

const STEP_TITLES = [
  'Project Basics',
  'Target Audience & Features',
  'Design & Aesthetics',
  'Tech Stack',
  'Review & Generate',
];

export function SmartPromptWizard({ onComplete, onCancel }: SmartPromptWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PromptWizardData>({
    step1: { projectName: '', description: '' },
    step2: { targetAudience: '', mainFeatures: '' },
    step3: { design: 'modern', colorScheme: 'blue' },
    step4: { technologies: ['React'], integrations: [] },
    step5: { additionalNotes: '', priority: 'balanced' },
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const prompt = generatePrompt(data);
    onComplete(data, prompt);
  };

  const stepContent = {
    1: (
      <Step1
        data={data.step1}
        onChange={(newData: typeof data.step1) => setData({ ...data, step1: newData })}
      />
    ),
    2: (
      <Step2
        data={data.step2}
        onChange={(newData: typeof data.step2) => setData({ ...data, step2: newData })}
      />
    ),
    3: (
      <Step3
        data={data.step3}
        onChange={(newData: typeof data.step3) => setData({ ...data, step3: newData })}
      />
    ),
    4: (
      <Step4
        data={data.step4}
        onChange={(newData: typeof data.step4) => setData({ ...data, step4: newData })}
      />
    ),
    5: (
      <Step5
        data={data.step5}
        onChange={(newData: typeof data.step5) => setData({ ...data, step5: newData })}
        allData={data}
      />
    ),
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <CardTitle>Smart Prompt Wizard</CardTitle>
                <p className="text-sm text-white/80 mt-1">
                  Step {currentStep} of 5: {STEP_TITLES[currentStep - 1]}
                </p>
              </div>
            </div>
            <div className="text-4xl font-bold text-white/30">{currentStep}</div>
          </div>
        </CardHeader>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <CardContent className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {stepContent[currentStep as keyof typeof stepContent]}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrev}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex gap-2">
            {currentStep < 5 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600"
              >
                <CheckCircle className="w-4 h-4" />
                Generate App
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Step Components
function Step1({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Project Name</label>
        <Input
          placeholder="e.g., My Awesome SaaS"
          value={data.projectName}
          onChange={(e) => onChange({ ...data, projectName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          placeholder="What is your project about? What problem does it solve?"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

function Step2({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Target Audience</label>
        <Input
          placeholder="e.g., Startup founders, Freelancers, Enterprises"
          value={data.targetAudience}
          onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Main Features</label>
        <Textarea
          placeholder="List main features separated by commas. e.g., User dashboard, Real-time notifications, Team collaboration"
          value={data.mainFeatures}
          onChange={(e) => onChange({ ...data, mainFeatures: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

function Step3({ data, onChange }: any) {
  const designs = ['modern', 'minimal', 'corporate', 'creative'] as const;
  const colors = ['blue', 'purple', 'green', 'orange'] as const;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Design Style</label>
        <div className="grid grid-cols-2 gap-3">
          {designs.map((design) => (
            <button
              key={design}
              onClick={() => onChange({ ...data, design })}
              className={`p-3 rounded-lg border-2 transition-all capitalize ${
                data.design === design
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {design}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Color Scheme</label>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((color) => {
            const colorMap = {
              blue: 'bg-blue-500',
              purple: 'bg-purple-500',
              green: 'bg-green-500',
              orange: 'bg-orange-500',
            };
            return (
              <button
                key={color}
                onClick={() => onChange({ ...data, colorScheme: color })}
                className={`p-4 rounded-lg border-2 transition-all capitalize ${
                  data.colorScheme === color
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                    : 'border-gray-200'
                }`}
              >
                <div className={`h-8 rounded ${colorMap[color]}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step4({ data, onChange }: any) {
  const allTechs = ['React', 'Vue', 'Svelte', 'Next.js', 'Node.js', 'Django', 'FastAPI'];
  const allIntegrations = ['Stripe', 'Auth0', 'Firebase', 'Supabase', 'SendGrid', 'Slack'];

  const toggleTech = (tech: string) => {
    const newTechs = data.technologies.includes(tech)
      ? data.technologies.filter((t: string) => t !== tech)
      : [...data.technologies, tech];
    onChange({ ...data, technologies: newTechs });
  };

  const toggleIntegration = (integration: string) => {
    const newIntegrations = data.integrations.includes(integration)
      ? data.integrations.filter((i: string) => i !== integration)
      : [...data.integrations, integration];
    onChange({ ...data, integrations: newIntegrations });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Technologies</label>
        <div className="flex flex-wrap gap-2">
          {allTechs.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1 rounded-full border-2 transition-all ${
                data.technologies.includes(tech)
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Integrations (Optional)</label>
        <div className="flex flex-wrap gap-2">
          {allIntegrations.map((integration) => (
            <button
              key={integration}
              onClick={() => toggleIntegration(integration)}
              className={`px-3 py-1 rounded-full border-2 transition-all ${
                data.integrations.includes(integration)
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {integration}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step5({ data, onChange, allData }: any) {
  const priorities = ['fast', 'quality', 'balanced'] as const;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h3 className="font-semibold">Summary</h3>
        <p className="text-sm">
          <strong>Project:</strong> {allData.step1.projectName || 'Not specified'}
        </p>
        <p className="text-sm">
          <strong>Design:</strong> {allData.step3.design} with {allData.step3.colorScheme} colors
        </p>
        <p className="text-sm">
          <strong>Stack:</strong> {allData.step4.technologies.join(', ')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Build Priority</label>
        <div className="grid grid-cols-3 gap-3">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={() => onChange({ ...data, priority })}
              className={`p-3 rounded-lg border-2 transition-all capitalize ${
                data.priority === priority
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {data.priority === 'fast' &&
            'Prioritize speed - may sacrifice some features'}
          {data.priority === 'quality' &&
            'Prioritize quality - takes more time'}
          {data.priority === 'balanced' &&
            'Balance speed and quality'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <Textarea
          placeholder="Any additional requirements or preferences?"
          value={data.additionalNotes}
          onChange={(e) => onChange({ ...data, additionalNotes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}

// Generate final prompt from wizard data
function generatePrompt(data: PromptWizardData): string {
  const prompt = `Create a ${data.step3.design} ${data.step1.projectName} application.

Description: ${data.step1.description}

Target Audience: ${data.step2.targetAudience}

Main Features:
${data.step2.mainFeatures}

Design Requirements:
- Style: ${data.step3.design}
- Color Scheme: ${data.step3.colorScheme}

Tech Stack:
- Technologies: ${data.step4.technologies.join(', ')}
${data.step4.integrations.length > 0 ? `- Integrations: ${data.step4.integrations.join(', ')}` : ''}

Build Priority: ${data.step5.priority}

${data.step5.additionalNotes ? `Additional Notes: ${data.step5.additionalNotes}` : ''}

Please generate a complete, production-ready application with best practices, proper error handling, and responsive design.`;

  return prompt;
}
