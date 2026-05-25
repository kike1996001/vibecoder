// src/hooks/useAppGeneration.ts
import { useCallback, useState } from 'react';
import { generateApp, refineApp, GeneratedFile, type LLMProvider } from '@/services/aiService';
import { webcontainerService } from '@/services/webcontainerService';
import { useAuth } from '@/hooks/useAuth';
import { useProjectStore } from '@/stores/projectStore';
import { generateTailwindConfig, generateGlobalCSS } from '@/services/designEngine';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/toast-notification';

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  isOpen: boolean;
  isActive: boolean;
  isModified: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'generating' | 'installing' | 'running' | 'error' | 'idle';
  files: ProjectFile[];
  previewUrl: string | null;
  error?: string;
  createdAt: number;
}

export function useAppGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { user, getAuthToken } = useAuth();
  const { success, error: showError, warning } = useToast();

  const createProject = useProjectStore((state) => state.createProject);
  const setProjectStatus = useProjectStore((state) => state.setProjectStatus);
  const setPreviewUrl = useProjectStore((state) => state.setPreviewUrl);
  const setActiveProject = useProjectStore((state) => state.setActiveProject);
  const updateFile = useProjectStore((state) => state.updateFile);

  // Handle SSE events from generation endpoint
  const handleGenerationEvent = useCallback((eventType: string, data: any) => {
    switch (eventType) {
      case 'generation_complete':
        success('✅ App generated successfully!');
        break;
      case 'credits_deducted':
        success(`💳 ${Math.abs(data.creditsDeducted || data.amount || 0)} credits deducted. Remaining: ${data.newBalance || 0}`);
        break;
      case 'generation_error':
        showError(`❌ Generation failed: ${data.message || 'Unknown error'}`);
        break;
      case 'credits_deduction_error':
        warning(`⚠️ ${data.message || 'Credits deduction error'}`);
        break;
      case 'insufficient_credits':
        showError(`❌ Insufficient credits. Need: ${data.required}, Available: ${data.available}`);
        break;
    }
  }, [success, showError, warning]);

  const generate = useCallback(
    async (prompt: string, options?: { provider?: string; model?: string; template?: 'landing' | 'saas' | 'ecommerce' | 'admin'; appType?: 'web' | 'mobile'; designAnswers?: any }) => {
      // TODO: Restore auth check after testing
      // if (!user?.id) {
      //   toast.error('User not authenticated');
      //   throw new Error('User not authenticated');
      // }

      setIsLoading(true);
      setStreamingText('');

      let projectId: string | null = null;

      try {
        // Get auth token
        const token = getAuthToken();
        
        success('🚀 Starting app generation...');

        // 1. Generate with AI
        const response = await generateApp(
          prompt,
          (text) => {
            setStreamingText(text);
          },
          {
            ...options,
            authToken: token || undefined,  // ✅ Pass token
            onEvent: handleGenerationEvent,  // ✅ Handle credit events
          }
        );

        // 2. Enrich with design system files
        const enrichedFiles: GeneratedFile[] = [
          ...response.files,
          {
            path: 'tailwind.config.ts',
            content: generateTailwindConfig(response.designTokens),
            language: 'typescript',
          },
          {
            path: 'src/app/globals.css',
            content: generateGlobalCSS(response.designTokens),
            language: 'css',
          },
        ];

        // 3. Create project in store (with userId)
        const userId = user?.id || 'anonymous-' + Date.now();  // Fallback for testing
        const project = createProject(
          userId,
          response.title,
          response.description,
          enrichedFiles.map((f) => ({
            path: f.path,
            content: f.content,
            language: f.language,
          })),
          [],
          []
        );

        projectId = project.id;
        setActiveProject(project.id);
        setProjectStatus(project.id, 'running');

        // Try to use WebContainer, but continue if it fails
        try {
          await webcontainerService.mountFiles(enrichedFiles);
          const installCode = await webcontainerService.installDependencies();
          if (installCode !== 0) {
            console.warn(`npm install failed with code ${installCode}`);
          }
          const previewUrl = await webcontainerService.startDevServer();
          setPreviewUrl(project.id, previewUrl);
        } catch (containerError) {
          console.warn('[Generation] WebContainer not available:', containerError);
          setPreviewUrl(project.id, null);
        }

        toast.success(`🚀 ${response.title} is live!`);
        return project;
      } catch (error) {
        if (projectId) {
          setProjectStatus(
            projectId,
            'error',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
        toast.error('Failed to generate app: ' + (error instanceof Error ? error.message : 'Unknown'));
        throw error;
      } finally {
        setIsLoading(false);
        setStreamingText('');
      }
    },
    [user?.id, createProject, setActiveProject, setProjectStatus, setPreviewUrl, handleGenerationEvent]
  );

  const refine = useCallback(
    async (prompt: string, projectId: string, options?: { provider?: string; model?: string; template?: 'landing' | 'saas' | 'ecommerce' | 'admin'; appType?: 'web' | 'mobile' }) => {
      setIsLoading(true);

      try {
        const token = getAuthToken();
        const project = useProjectStore.getState().projects.find((p) => p.id === projectId);
        if (!project) throw new Error('Project not found');

        const currentFiles = project.files.map((f) => ({
          path: f.path,
          content: f.content,
          language: f.language,
        }));
        
        success('🚀 Refining app...');

        const response = await refineApp(
          prompt,
          currentFiles,
          (text) => {
            setStreamingText(text);
          },
          {
            ...options,
            authToken: token || undefined,
            onEvent: handleGenerationEvent,
          }
        );

        // Update files
        for (const file of response.files) {
          const existingFile = project.files.find((f) => f.path === file.path);
          if (existingFile) {
            updateFile(projectId, existingFile.id, file.content);
          }
        }

        // Remount and restart
        await webcontainerService.mountFiles(response.files);
        await webcontainerService.installDependencies();
        
        webcontainerService.resetServerUrl();
        const previewUrl = await webcontainerService.startDevServer();
        setPreviewUrl(projectId, previewUrl);

        success('✅ App updated successfully');
      } catch (error) {
        showError('Failed to refine: ' + (error instanceof Error ? error.message : 'Unknown'));
        throw error;
      } finally {
        setIsLoading(false);
        setStreamingText('');
      }
    },
    [updateFile, setPreviewUrl, handleGenerationEvent, getAuthToken, success, showError]
  );

  return {
    generateApp: generate,
    refineApp: refine,
    isLoading,
    streamingText,
  };
}