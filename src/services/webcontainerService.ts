// src/services/webcontainerService.ts
import { WebContainer } from '@webcontainer/api';
import { GeneratedFile } from './aiService';

let webcontainerInstance: WebContainer | null = null;
let serverUrl: string | null = null;

export const webcontainerService = {
  async boot(): Promise<void> {
    if (webcontainerInstance) return;
    
    webcontainerInstance = await WebContainer.boot();
    console.log('[WebContainer] Booted successfully');
  },

  async mountFiles(files: GeneratedFile[]): Promise<void> {
    if (!webcontainerInstance) throw new Error('WebContainer not booted');

    const fileTree: Record<string, any> = {};

    for (const file of files) {
      const parts = file.path.split('/');
      let current = fileTree;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        current = current[part].directory;
      }

      const fileName = parts[parts.length - 1];
      current[fileName] = {
        file: {
          contents: file.content,
        },
      };
    }

    // Add package.json if not present
    if (!fileTree['package.json']) {
      fileTree['package.json'] = {
        file: {
          contents: JSON.stringify({
            name: 'generated-app',
            version: '1.0.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
            },
            dependencies: {
              next: '^14.0.0',
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              typescript: '^5.3.0',
              '@types/node': '^20.0.0',
              '@types/react': '^18.2.0',
              '@types/react-dom': '^18.2.0',
              tailwindcss: '^3.4.0',
              postcss: '^8.4.0',
              autoprefixer: '^10.4.0',
              'tailwindcss-animate': '^1.0.7',
              'class-variance-authority': '^0.7.0',
              clsx: '^2.1.0',
              'tailwind-merge': '^2.2.0',
              'framer-motion': '^11.0.0',
              'lucide-react': '^0.400.0',
            },
          }, null, 2),
        },
      };
    }

    // Add tsconfig.json if not present
    if (!fileTree['tsconfig.json']) {
      fileTree['tsconfig.json'] = {
        file: {
          contents: JSON.stringify({
            compilerOptions: {
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [{ name: 'next' }],
              paths: { '@/*': ['./src/*'] },
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules'],
          }, null, 2),
        },
      };
    }

    // Add next.config.js
    if (!fileTree['next.config.js']) {
      fileTree['next.config.js'] = {
        file: {
          contents: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;`,
        },
      };
    }

    // Add postcss.config.js
    if (!fileTree['postcss.config.js']) {
      fileTree['postcss.config.js'] = {
        file: {
          contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
        },
      };
    }

    await webcontainerInstance.mount(fileTree);
    console.log('[WebContainer] Files mounted');
  },

  async installDependencies(): Promise<number> {
    if (!webcontainerInstance) throw new Error('WebContainer not booted');

    const installProcess = await webcontainerInstance.spawn('npm', ['install']);

    return new Promise((resolve) => {
      installProcess.exit.then((code) => {
        console.log('[WebContainer] npm install exited with code:', code);
        resolve(code || 0);
      });
    });
  },

  async startDevServer(): Promise<string> {
    if (!webcontainerInstance) throw new Error('WebContainer not booted');

    const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);

    webcontainerInstance.on('server-ready', (port, url) => {
      console.log('[WebContainer] Server ready at:', url);
      serverUrl = url;
    });

    // Wait for server to be ready
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (serverUrl) {
          resolve(serverUrl);
        } else {
          reject(new Error('Server startup timeout'));
        }
      }, 30000);

      const checkInterval = setInterval(() => {
        if (serverUrl) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(serverUrl);
        }
      }, 500);
    });
  },

  async writeFile(path: string, content: string): Promise<void> {
    if (!webcontainerInstance) throw new Error('WebContainer not booted');
    await webcontainerInstance.fs.writeFile(path, content);
  },

  getServerUrl(): string | null {
    return serverUrl;
  },

  resetServerUrl(): void {
    serverUrl = null;
  },
};