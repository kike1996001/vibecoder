import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  FolderOpen, 
  Folder, 
  FileCode,
  File,
  Search,
  PanelRight,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/projectStore';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
}

function getFileIcon(path: string) {
  if (path.endsWith('.tsx') || path.endsWith('.ts')) return <FileCode className="h-3.5 w-3.5 text-cyan-400/80" />;
  if (path.endsWith('.css')) return <File className="h-3.5 w-3.5 text-sky-400/80" />;
  if (path.endsWith('.html')) return <File className="h-3.5 w-3.5 text-orange-400/80" />;
  if (path.endsWith('.json')) return <File className="h-3.5 w-3.5 text-emerald-400/80" />;
  return <File className="h-3.5 w-3.5 text-white/40" />;
}

function FileTreeItem({ node, depth = 0, onFileSelect, activeFile }: { 
  node: FileNode; 
  depth?: number; 
  onFileSelect?: (filePath: string) => void; 
  activeFile?: string 
}) {
  const [isOpen, setIsOpen] = useState(true);
  
  const activeProjectId = useProjectStore(state => state.activeProjectId);
  const projects = useProjectStore(state => state.projects);
  const project = projects.find(p => p.id === activeProjectId);
  const openFile = useProjectStore(state => state.openFile);
  const setFileActive = useProjectStore(state => state.setFileActive);
  
  const fileInProject = project?.files.find(f => f.path === node.path);
  const isActive = activeFile ? activeFile === node.path : fileInProject?.isActive || false;

  if (node.type === 'folder') {
    return (
      <div>
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 cursor-pointer rounded-md"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight className="h-3 w-3 text-white/40" />
          </motion.div>
          {isOpen ? (
            <FolderOpen className="h-4 w-4 text-amber-500/60" />
          ) : (
            <Folder className="h-4 w-4 text-amber-500/60" />
          )}
          <span className="text-[11px] text-white/50 font-medium">{node.name}</span>
        </motion.div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {node.children?.map((child) => (
                <FileTreeItem key={child.path} node={child} depth={depth + 1} onFileSelect={onFileSelect} activeFile={activeFile} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const handleClick = () => {
    if (onFileSelect) {
      onFileSelect(node.path);
    } else if (fileInProject) {
      if (!fileInProject.isOpen) openFile(project!.id, fileInProject.id);
      setFileActive(project!.id, fileInProject.id);
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-2 py-[3px] cursor-pointer rounded-md transition-colors',
        isActive && 'bg-violet-500/10'
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      {getFileIcon(node.path)}
      <span className={cn(
        'text-[11px] truncate',
        isActive ? 'font-medium text-violet-400' : 'text-white/50 hover:text-white/70'
      )}>
        {node.name}
      </span>
      {fileInProject?.isModified && (
        <span className="w-1 h-1 rounded-full bg-violet-400 ml-auto shrink-0" />
      )}
    </motion.div>
  );
}

interface FileExplorerProps {
  onFileSelect?: (filePath: string) => void;
  activeFile?: string;
  compact?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FileExplorer({ onFileSelect, activeFile, compact, isCollapsed = false, onToggleCollapse }: FileExplorerProps = {}) {
  const isCompact = Boolean(compact);
  const activeProjectId = useProjectStore(state => state.activeProjectId);
  const projects = useProjectStore(state => state.projects);
  const project = projects.find(p => p.id === activeProjectId);

  const buildTree = (): FileNode[] => {
    if (!project) return [];
    const root: FileNode[] = [];
    const map = new Map<string, FileNode>();
    
    for (const file of project.files) {
      const parts = file.path.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!map.has(currentPath)) {
          const node: FileNode = {
            name: part,
            type: isLast ? 'file' : 'folder',
            path: file.path,
            children: isLast ? undefined : [],
          };
          map.set(currentPath, node);
          if (parentPath) {
            const parent = map.get(parentPath);
            parent?.children?.push(node);
          } else {
            root.push(node);
          }
        }
      }
    }
    return root;
  };

  const tree = buildTree();

  return (
    <div className={cn('h-full flex flex-col bg-[#0a0a0f]', isCompact && 'bg-transparent')}>
      <div className={cn('flex items-center justify-between px-3 border-b border-white/[0.06] shrink-0', isCollapsed ? 'h-10' : (isCompact ? 'h-8' : 'h-9'))}>
        <span className={cn('text-[10px] font-semibold text-white/40 uppercase tracking-wider', isCollapsed && 'hidden')}>
          Explorer
        </span>
        {!isCollapsed && project && (
          <span className="ml-auto text-[10px] text-white/30">
            {project.files.length} files
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            "p-1 rounded-md hover:bg-white/[0.06] transition-colors",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand file explorer" : "Collapse file explorer"}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4 text-white/60 hover:text-white/100" />
          ) : (
            <PanelRight className="h-4 w-4 text-white/60 hover:text-white/100" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="px-2 py-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Search className="h-3 w-3 text-white/40" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="bg-transparent text-[11px] text-white/50 placeholder:text-white/25 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto py-1">
            {project ? (
              tree.map((node) => (
                <FileTreeItem key={node.path} node={node} onFileSelect={onFileSelect} activeFile={activeFile} />
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-[11px] text-white/40">Sin proyecto activo</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}