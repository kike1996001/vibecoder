import { motion } from "framer-motion";
import { useMemo } from "react";

const codeSnippets: Record<string, string> = {
  "src/App.tsx": `import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { Editor } from "./pages/Editor";

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}`,
  "src/main.tsx": `import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}`,
};

export function CodeEditor({ file, content }: { file: string; content?: string }) {
  const code = useMemo(() => content ?? codeSnippets[file] ?? "// Select a file to edit", [content, file]);
  const lines = code.split("\n");

  return (
    <div className="h-full bg-[#0f172a] text-[#e2e8f0] font-mono text-sm overflow-auto code-scrollbar">
      <div className="min-w-full">
        {lines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.01 }}
            className="flex hover:bg-white/5"
          >
            <span className="w-12 shrink-0 text-right pr-4 text-slate-500 select-none border-r border-slate-800">
              {index + 1}
            </span>
            <span className="pl-4 whitespace-pre">{line}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

