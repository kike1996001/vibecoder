import JSZip from 'jszip';

interface DeployOptions {
  projectName: string;
  framework?: 'nextjs' | 'react' | 'vue' | 'svelte';
  rootDirectory?: string;
  buildCommand?: string;
  outputDirectory?: string;
}

interface DeployResult {
  id: string;
  url: string;
  state: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR';
  alias?: string[];
}

// Use backend proxy - never expose Vercel token to frontend!
const BACKEND_API = import.meta.env.VITE_API_URL || 'http://localhost:5178/api';

export const deployService = {
  async createDeployment(
    files: Record<string, string>,
    options: DeployOptions
  ): Promise<DeployResult> {
    // 1. Crear ZIP con los archivos
    const zip = new JSZip();
    
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // 2. Upload to backend - backend handles Vercel auth
    const formData = new FormData();
    formData.append('file', new File([zipBlob], 'project.zip'));
    formData.append('projectName', options.projectName);
    formData.append('framework', options.framework || 'react');

    const deployResponse = await fetch(`${BACKEND_API}/deploy`, {
      method: 'POST',
      body: formData,
      // No Authorization header - backend is trusted, handles Vercel auth
    });

    if (!deployResponse.ok) {
      const error = await deployResponse.json();
      throw new Error(error.message || 'Deploy failed');
    }

    const result: DeployResult = await deployResponse.json();
    return result;
  },

  async pollDeploymentStatus(deploymentId: string): Promise<DeployResult> {
    const response = await fetch(
      `${BACKEND_API}/deploy/status/${deploymentId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check deployment status');
    }

    return response.json();
  },

  async createProject(name: string): Promise<{ id: string; name: string }> {
    const response = await fetch(`${BACKEND_API}/deploy/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        framework: 'nextjs',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Si ya existe, no es error
      if (error.error?.code === 'already_exists') {
        return { id: name.toLowerCase().replace(/\s+/g, '-'), name };
      }
      throw new Error(error.message || 'Failed to create project');
    }

    return response.json();
  },

  async addDomain(projectId: string, domain: string): Promise<void> {
    const response = await fetch(
      `${BACKEND_API}/deploy/domain`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, domain }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add domain');
    }
  },
};
