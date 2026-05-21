// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: "free" | "discover" | "pro" | "enterprise";
  credits: number;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  type: "react" | "nextjs" | "vue" | "svelte" | "angular";
  status: "active" | "building" | "idle" | "error" | "deployed";
  files: GeneratedFile[];
  settings: ProjectSettings;
  createdAt: number;
  updatedAt: number;
  deployedUrl?: string;
}

export interface GeneratedFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isOpen: boolean;
  isModified: boolean;
  isGenerated: boolean;
}

export interface ProjectSettings {
  theme: "light" | "dark" | "system";
  framework: string;
  styling: string;
  database?: string;
  authentication: boolean;
}

// Message types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type: "text" | "code" | "component" | "file" | "error" | "image";
  metadata?: MessageMetadata;
  timestamp: number;
}

export interface MessageMetadata {
  language?: string;
  filename?: string;
  component?: string;
  code?: string;
  imageUrl?: string;
  actions?: MessageAction[];
}

export interface MessageAction {
  label: string;
  action: string;
  icon?: string;
}

// AI types
export interface AIRequest {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Component types
export interface UIComponent {
  id: string;
  name: string;
  description: string;
  code: string;
  preview?: string;
  dependencies: string[];
  props: ComponentProp[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

// API types
export interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  parameters?: APIParameter[];
  responses?: APIResponse[];
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface APIResponse {
  status: number;
  description: string;
  schema?: Record<string, any>;
}
