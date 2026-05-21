import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '@/store/useProjectStore';
import { webcontainerService } from '@/services/webcontainerService';
import { motion } from 'framer-motion';
import { X, FileCode, Sparkles, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIInlineEdit } from '@/components/editor/AIInlineEdit';

export function MonacoEditor() {
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const projects = useProjectStore((state) => state.projects);
  const updateFile = useProjectStore((state) => state.updateFile);
  const setFileActive = useProjectStore((state) => state.setFileActive);
  const closeFile = useProjectStore((state) => state.closeFile);

  const project = projects.find((p) => p.id === activeProjectId);
  const openFiles = project?.files.filter((f) => f.isOpen) || [];
  const activeFile = openFiles.find((f) => f.isActive);

  const [editorContent, setEditorContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<any>(null);
  const [showInlineEdit, setShowInlineEdit] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content);
      setShowInlineEdit(false);
      setSelectedText('');
      setSelectionRange(null);
    }
  }, [activeFile?.id]);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Lovable-style editor theme customization
    monaco.editor.defineTheme('lovable-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F97316' },
        { token: 'string', foreground: '22C55E' },
        { token: 'number', foreground: 'EAB308' },
        { token: 'tag', foreground: 'F97316' },
        { token: 'attribute.name', foreground: '60A5FA' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.lineHighlightBackground': '#161b2200',
        'editorLineNumber.foreground': '#374151',
        'editorLineNumber.activeForeground': '#6B7280',
        'editor.selectionBackground': '#F9731620',
        'editor.inactiveSelectionBackground': '#F9731610',
        'editorCursor.foreground': '#F97316',
        'editorSuggestWidget.background': '#1a1a1a',
        'editorSuggestWidget.border': '#27272a',
        'editorSuggestWidget.selectedBackground': '#F9731620',
      }
    });
    monaco.editor.setTheme('lovable-dark');
  }, []);

  const captureSelection = useCallback(() => {
    if (!editorRef.current || !activeFile) return;
    const selection = editorRef.current.getSelection();
    const text = editorRef.current.getModel().getValueInRange(selection);
    if (!text || text.trim().length === 0) return;
    setSelectedText(text);
    setSelectionRange(selection);
    setShowInlineEdit(true);
  }, [activeFile]);

  const handleEditorChange = useCallback(
    async (value: string | undefined) => {
      if (!value || !activeFile || !project) return;
      setEditorContent(value);
      updateFile(project.id, activeFile.id, value);
      try {
        await webcontainerService.writeFile(activeFile.path, value);
      } catch (e) {
        console.error('Failed to sync to WebContainer:', e);
      }
    },
    [activeFile, project, updateFile]
  );

  const handleApplyEdit = useCallback(
    (modifiedText: string) => {
      if (!editorRef.current || !selectionRange || !activeFile || !project) return;
      editorRef.current.executeEdits('ai-inline-edit', [
        { range: selectionRange, text: modifiedText, forceMoveMarkers: true },
      ]);
      const model = editorRef.current.getModel();
      if (model) {
        const updatedText = model.getValue();
        setEditorContent(updatedText);
        updateFile(project.id, activeFile.id, updatedText);
        webcontainerService.writeFile(activeFile.path, updatedText).catch((e) => {
          console.error('Failed to sync edited file to WebContainer:', e);
        });
      }
      setShowInlineEdit(false);
      setSelectedText('');
      setSelectionRange(null);
    },
    [activeFile, project, selectionRange, updateFile]
  );

  const getLanguage = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-600">
        <div className="text-center space-y-3">
          <FileCode className="h-10 w-10 mx-auto opacity-20" />
          <p className="text-[13px]">Genera una app para empezar a editar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Tabs - Lovable style: minimal, clean */}
      <div className="h-9 flex items-center bg-[#0d1117] border-b border-white/[0.06] overflow-x-auto">
        {openFiles.map((file) => (
          <motion.button
            key={file.id}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            onClick={() => setFileActive(project.id, file.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-[11px] border-r border-white/[0.04] min-w-fit transition-all group',
              file.isActive
                ? 'bg-[#161b22] text-zinc-200 border-t-2 border-t-orange-500'
                : 'text-zinc-600 hover:text-zinc-400'
            )}
          >
            <FileCode className="h-3 w-3 opacity-60" />
            <span className="truncate max-w-[100px]">{file.path.split('/').pop()}</span>
            {file.isModified && <span className="w-1 h-1 rounded-full bg-orange-500" />}
            <X
              className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-red-400 ml-1 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(project.id, file.id);
              }}
            />
          </motion.button>
        ))}
      </div>

      {activeFile ? (
        <div className="relative flex-1">
          {/* AI Inline Edit Button - Floating */}
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              onClick={captureSelection}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#1a1a1a]/90 backdrop-blur px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:border-orange-500/30 hover:text-orange-400 hover:bg-[#1a1a1a]"
              disabled={!editorRef.current}
            >
              <Sparkles className="h-3 w-3" />
              AI Edit
              <span className="px-1 py-0.5 rounded bg-white/[0.06] text-[9px] text-zinc-600 ml-1">⌘K</span>
            </button>
          </div>

          <Editor
            height="100%"
            language={getLanguage(activeFile.path)}
            value={editorContent}
            theme="lovable-dark"
            onMount={handleEditorMount}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              fontLigatures: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
              formatOnType: true,
              lineHeight: 22,
              folding: true,
              renderLineHighlight: 'line',
              matchBrackets: 'always',
              tabSize: 2,
            }}
            loading={
              <div className="h-full flex items-center justify-center text-zinc-700">
                <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
              </div>
            }
          />

          {showInlineEdit && selectedText ? (
            <div className="absolute inset-0 z-50 flex items-start justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-sm">
                <AIInlineEdit
                  filePath={activeFile.path}
                  selectedText={selectedText}
                  onApply={handleApplyEdit}
                  onClose={() => setShowInlineEdit(false)}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-zinc-700">
          <div className="text-center space-y-2">
            <FileCode className="h-8 w-8 mx-auto opacity-20" />
            <p className="text-[13px]">Selecciona un archivo del explorador</p>
          </div>
        </div>
      )}
    </div>
  );
}