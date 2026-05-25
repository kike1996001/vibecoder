import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  isOpen: boolean;
  isModified: boolean;
  isActive: boolean;
}

export type GeneratedFile = ProjectFile;

export interface Project {
  id: string;
  userId: string;  // ✅ NEW: Associate with user
  name: string;
  description: string;
  files: ProjectFile[];
  dependencies: string[];
  devDependencies: string[];
  previewUrl: string | null;
  createdAt: number;
  updatedAt: number;
  status: "idle" | "generating" | "installing" | "running" | "error";
  error: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | null;
  isGenerating: boolean;
  generationProgress: number;
  streamingContent: string;

  // Actions
  createProject: (
    userId: string,  // ✅ NEW: Required parameter
    name: string,
    description: string,
    files: Omit<ProjectFile, "id" | "isOpen" | "isModified" | "isActive">[],
    dependencies: string[],
    devDependencies: string[]
  ) => Project;
  setActiveProject: (id: string | null) => void;
  updateFile: (projectId: string, fileId: string, content: string) => void;
  setFileActive: (projectId: string, fileId: string) => void;
  openFile: (projectId: string, fileId: string) => void;
  closeFile: (projectId: string, fileId: string) => void;
  setProjectStatus: (projectId: string, status: Project["status"], error?: string) => void;
  setPreviewUrl: (projectId: string, url: string | null) => void;
  setStreamingContent: (content: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  deleteProject: (id: string) => void;
  addMessage: (projectId: string, message: Message) => void;
  addFile: (projectId: string, file: Omit<ProjectFile, "id">) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set, get) => ({
      projects: [],
      activeProjectId: null,
      activeProject: null,
      isGenerating: false,
      generationProgress: 0,
      streamingContent: "",

      createProject: (userId, name, description, files, dependencies, devDependencies) => {
        const project: Project = {
          id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,  // ✅ Store userId
          name,
          description,
          files: files.map((file, index) => ({
            ...file,
            id: `file_${Date.now()}_${index}`,
            isOpen: index === 0,
            isModified: false,
            isActive: index === 0,
          })),
          dependencies,
          devDependencies,
          previewUrl: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "idle",
          error: null,
        };

        set((state) => {
          state.projects.push(project);
          state.activeProjectId = project.id;
          state.activeProject = project;
        });

        return project;
      },

      setActiveProject: (id) => {
        set((state) => {
          state.activeProjectId = id;
          state.activeProject = state.projects.find((project: Project) => project.id === id) ?? null;
        });
      },

      updateFile: (projectId, fileId, content) => {
        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (!project) return;

          const file = project.files.find((f: ProjectFile) => f.id === fileId);
          if (file) {
            file.content = content;
            file.isModified = true;
            project.updatedAt = Date.now();
          }

          if (state.activeProject?.id === projectId) {
            state.activeProject = project;
          }
        });
      },

      setFileActive: (projectId, fileId) => {
        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (!project) return;

          project.files.forEach((file: ProjectFile) => {
            file.isActive = file.id === fileId;
          });

          if (state.activeProject?.id === projectId) {
            state.activeProject = project;
          }
        });
      },

      openFile: (projectId, fileId) => {
        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (!project) return;

          const file = project.files.find((f: ProjectFile) => f.id === fileId);
          if (file && !file.isOpen) {
            file.isOpen = true;
            file.isActive = true;
            project.files.forEach((f: ProjectFile) => {
              if (f.id !== fileId) f.isActive = false;
            });
          }

          if (state.activeProject?.id === projectId) {
            state.activeProject = project;
          }
        });
      },

      closeFile: (projectId, fileId) => {
        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (!project) return;

          const file = project.files.find((f: ProjectFile) => f.id === fileId);
          if (file) {
            file.isOpen = false;
            file.isActive = false;

            const nextOpen = project.files.find((f: ProjectFile) => f.isOpen);
            if (nextOpen) nextOpen.isActive = true;
          }

          if (state.activeProject?.id === projectId) {
            state.activeProject = project;
          }
        });
      },

      setProjectStatus: (projectId, status, error) => {
        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (project) {
            project.status = status;
            project.error = error ?? null;
            project.updatedAt = Date.now();
          }

          if (state.activeProject?.id === projectId) {
            state.activeProject = state.projects.find((p: Project) => p.id === projectId) ?? null;
          }
        });
      },

      setPreviewUrl: (projectId, url) => {
        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (project) {
            project.previewUrl = url;
            if (state.activeProject?.id === projectId) {
              state.activeProject = project;
            }
          }
        });
      },

      setStreamingContent: (content) => {
        set((state) => {
          state.streamingContent = content;
        });
      },

      setIsGenerating: (isGenerating) => {
        set((state) => {
          state.isGenerating = isGenerating;
        });
      },

      deleteProject: (id) => {
        set((state) => {
          state.projects = state.projects.filter((p: Project) => p.id !== id);
          if (state.activeProjectId === id) {
            state.activeProjectId = state.projects[0]?.id ?? null;
            state.activeProject = state.projects[0] ?? null;
          }
        });
      },

      addMessage: (_projectId, _message) => {
        set(() => {
          // Intentionally left blank for message storage if needed later.
        });
      },

      addFile: (projectId, file) => {
        const newFile: ProjectFile = {
          ...file,
          id: `file_${Date.now()}`,
          isOpen: true,
          isModified: false,
          isActive: false,
        };

        set((state) => {
          const project = state.projects.find((p: Project) => p.id === projectId);
          if (!project) return;

          project.files.push(newFile);
          project.updatedAt = Date.now();

          if (state.activeProject?.id === projectId) {
            state.activeProject = project;
          }
        });
      },
    })),
    {
      name: "workshop-projects-v2",
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        activeProject: state.activeProject,
      }),
    }
  )
);