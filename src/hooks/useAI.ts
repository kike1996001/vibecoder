import { useState, useCallback, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "code" | "component" | "file" | "error";
  metadata?: {
    language?: string;
    filename?: string;
    component?: string;
    code?: string;
  };
  timestamp: number;
}

interface UseAIReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  streamingContent: string;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
}

// Simulated AI responses for demo
const simulatedResponses = [
  "I'll create a modern analytics dashboard with real-time charts using Recharts and Framer Motion for smooth animations.",
  "Let me generate a responsive navigation component with mobile hamburger menu and smooth scroll behavior.",
  "I'll build an authentication system with Supabase integration, including login, signup, and password reset flows.",
  "Creating a data table with sorting, filtering, and pagination using TanStack Table and shadcn/ui components.",
];

export function useAI(): UseAIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const simulateStreaming = useCallback((text: string, onComplete: () => void) => {
    setIsStreaming(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setStreamingContent(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setStreamingContent("");
        onComplete();
      }
    }, 15);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      type: "text",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
    
    simulateStreaming(randomResponse, () => {
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: randomResponse,
        type: "component",
        metadata: {
          component: "GeneratedComponent",
          code: "// Generated code will appear here",
        },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    });
  }, [simulateStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingContent("");
    abortRef.current?.abort();
  }, []);

  const regenerateMessage = useCallback(async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;

    // Remove the AI response and regenerate
    setMessages((prev) => prev.slice(0, messageIndex));
    await sendMessage(userMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    streamingContent,
    sendMessage,
    clearMessages,
    regenerateMessage,
  };
}