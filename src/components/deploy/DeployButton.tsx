import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Globe, CheckCircle2, Loader2, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deployService } from '@/services/deployService';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from 'sonner';

export function DeployButton() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [deployState, setDeployState] = useState<'idle' | 'building' | 'ready' | 'error'>('idle');

  const activeProject = useProjectStore((state) => {
    const id = state.activeProjectId;
    return state.projects.find((p) => p.id === id);
  });

  const handleDeploy = async () => {
    if (!activeProject) {
      toast.error('No active project to deploy');
      return;
    }

    setIsDeploying(true);
    setDeployState('building');

    try {
      const files: Record<string, string> = {};
      activeProject.files.forEach((file) => {
        files[file.path] = file.content;
      });

      if (!files['package.json']) {
        files['package.json'] = JSON.stringify({
          name: activeProject.name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          private: true,
          scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
          dependencies: {
            next: '^14.0.0', react: '^18.2.0', 'react-dom': '^18.2.0',
            typescript: '^5.3.0', tailwindcss: '^3.4.0', 'framer-motion': '^11.0.0',
            'lucide-react': '^0.400.0', 'class-variance-authority': '^0.7.0',
            clsx: '^2.1.0', 'tailwind-merge': '^2.2.0', 'tailwindcss-animate': '^1.0.7',
          },
          devDependencies: {
            '@types/node': '^20.0.0', '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0', autoprefixer: '^10.4.0', postcss: '^8.4.0',
          },
        }, null, 2);
      }

      await deployService.createProject(activeProject.name);
      const deployment = await deployService.createDeployment(files, {
        projectName: activeProject.name,
        framework: 'nextjs',
      });

      const pollInterval = setInterval(async () => {
        try {
          const status = await deployService.pollDeploymentStatus(deployment.id);
          if (status.state === 'READY') {
            clearInterval(pollInterval);
            setDeployUrl(status.url);
            setDeployState('ready');
            toast.success('🚀 App deployed successfully!');
          } else if (status.state === 'ERROR') {
            clearInterval(pollInterval);
            setDeployState('error');
            toast.error('Deploy failed');
          }
        } catch (e) {
          clearInterval(pollInterval);
          setDeployState('error');
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (deployState === 'building') setDeployState('error');
      }, 300000);

    } catch (error) {
      setDeployState('error');
      toast.error('Deploy failed: ' + (error instanceof Error ? error.message : 'Unknown'));
    } finally {
      setIsDeploying(false);
    }
  };

  const copyUrl = () => {
    if (deployUrl) {
      navigator.clipboard.writeText(`https://${deployUrl}`);
      toast.success('URL copied to clipboard');
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {deployState === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || !activeProject}
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
            >
              {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {isDeploying ? 'Deploying...' : 'Deploy to Vercel'}
            </Button>
          </motion.div>
        )}

        {deployState === 'building' && (
          <motion.div key="building" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-400">Building...</p>
              <p className="text-xs text-amber-400/60">This may take a minute</p>
            </div>
          </motion.div>
        )}

        {deployState === 'ready' && deployUrl && (
          <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">{deployUrl}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={copyUrl}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <Copy className="h-4 w-4" />
            </motion.button>
            <motion.a href={`https://${deployUrl}`} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ExternalLink className="h-4 w-4" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}