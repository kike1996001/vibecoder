import { useState, useEffect } from 'react';
import { Loader2, Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';

interface PreviewFrameProps {
  deviceView?: 'desktop' | 'tablet' | 'mobile';
  setDeviceView?: (view: 'desktop' | 'tablet' | 'mobile') => void;
}

export function PreviewFrame({ deviceView = 'desktop', setDeviceView }: PreviewFrameProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const projects = useProjectStore((state) => state.projects);
  const project = projects.find((p) => p.id === activeProjectId);
  const previewUrl = project?.previewUrl;

  useEffect(() => {
    if (previewUrl) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [previewUrl]);

  const getDeviceStyles = () => {
    switch (deviceView) {
      case 'mobile':
        return {
          width: '375px',
          height: '812px',
          maxWidth: '100%',
          aspectRatio: '375/812',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
          aspectRatio: '768/1024',
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          height: '100%',
          aspectRatio: 'auto',
        };
    }
  };

  return (
    <div className="h-full bg-[#0a0a0a] overflow-hidden flex flex-col">
      {/* Device Selector */}
      <div className="shrink-0 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5">
          <button
            onClick={() => setDeviceView?.('mobile')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              deviceView === 'mobile'
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            )}
            title="Mobile (375x812)"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeviceView?.('tablet')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              deviceView === 'tablet'
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            )}
            title="Tablet (768x1024)"
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeviceView?.('desktop')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              deviceView === 'desktop'
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            )}
            title="Desktop (Full Width)"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-white/30 uppercase tracking-wider capitalize">
            {deviceView}
          </span>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all"
            title="Refresh preview"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#0a0a0a]">
        <div 
          className="relative bg-[#0f0f0f] rounded-xl border border-white/[0.06] shadow-2xl overflow-hidden"
          style={getDeviceStyles()}
        >
          {isLoading && previewUrl && (
            <div className="absolute inset-0 z-20 bg-[#0a0a0a]/90 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto">
                  <Loader2 className="h-8 w-8 animate-spin opacity-30" />
                </div>
                <div>
                  <p className="font-medium text-[15px] text-zinc-300">Loading preview...</p>
                  <p className="text-[13px] text-zinc-500 mt-1 max-w-xs mx-auto">Please wait while your app becomes available.</p>
                </div>
              </div>
            </div>
          )}

          {previewUrl ? (
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
              title="App Preview"
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-700 p-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto">
                  <Loader2 className="h-8 w-8 animate-spin opacity-30" />
                </div>
                <div>
                  <p className="font-medium text-[15px] text-zinc-500">No preview available</p>
                  <p className="text-[13px] text-zinc-700 mt-1 max-w-xs mx-auto">
                    Generate an app using the chat to see a live preview here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
