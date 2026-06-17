import React, { useState } from 'react';
import {
  Menu, Undo2, Redo2, Save,
  ZoomIn, ZoomOut, LayoutTemplate, Sparkles, RotateCcw, FolderOpen, Check
} from 'lucide-react';
import { useStore } from '../../store';

interface HeaderProps {
  onOpenTemplates?: () => void;
  onOpenAIDraw?: () => void;
  onToggleMenu?: () => void;
  onZoomChange?: (scale: number) => void;
  onReopenWelcome?: () => void;
  onOpenProjectManager?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenTemplates, onOpenAIDraw, onToggleMenu, onZoomChange, onReopenWelcome, onOpenProjectManager }) => {
  const { canvasScale, setCanvasScale, triggerUndo, triggerRedo, clearCanvas, canUndo, canRedo, saveProject, currentProjectId, currentProjectName } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  const handleZoomChange = (newScale: number) => {
    setCanvasScale(newScale);
    onZoomChange?.(newScale);
  };

  const handleSave = () => {
    if (!currentProjectId) return;
    saveProject();
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  return (
    <header className="h-14 bg-gray-950 border-b border-gray-850 flex items-center justify-between px-4 z-50 select-none">
      <div className="flex items-center space-x-3">
        <button
          className="text-gray-400 hover:text-white transition-colors"
          onClick={onReopenWelcome || onToggleMenu}
          disabled={!onReopenWelcome && !onToggleMenu}
        >
          <Menu size={20} />
        </button>
        {/* Project name - clickable to open project manager */}
        <button
          onClick={onOpenProjectManager}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-200 hover:text-white transition-colors group"
          title="项目管理"
        >
          <span className="truncate max-w-[160px]">{currentProjectName}</span>
          <FolderOpen size={14} className="text-gray-500 group-hover:text-gray-300 shrink-0" />
        </button>
        <div className="h-4 w-px bg-gray-700 mx-1"></div>
        <div className="flex space-x-1">
           <button
             onClick={triggerUndo}
             disabled={!canUndo}
             className={`p-2 rounded hover:bg-gray-800 ${canUndo ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
             title="撤销"
           >
             <Undo2 size={18} />
           </button>
           <button
             onClick={triggerRedo}
             disabled={!canRedo}
             className={`p-2 rounded hover:bg-gray-800 ${canRedo ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
             title="重做"
           >
             <Redo2 size={18} />
           </button>
        </div>
        <div className="h-4 w-px bg-gray-700 mx-1"></div>
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!currentProjectId}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all ${
            saveFlash
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : currentProjectId
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
                : 'bg-gray-800/50 text-gray-600 border border-gray-800 cursor-not-allowed'
          }`}
          title={currentProjectId ? '保存项目 (Ctrl+S)' : '请先创建项目'}
        >
          {saveFlash ? <Check size={14} /> : <Save size={14} />}
          <span className="hidden sm:inline">{saveFlash ? '已保存' : '保存'}</span>
        </button>
        <div className="h-4 w-px bg-gray-700 mx-1"></div>
        {/* Template button */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-sm"
          title="模板库"
        >
          <LayoutTemplate size={16} />
          <span>模板</span>
        </button>
        {/* AI Draw button */}
        <button
          onClick={onOpenAIDraw}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 transition-all text-sm"
          title="AI 绘图"
        >
          <Sparkles size={16} />
          <span>AI 绘图</span>
        </button>
      </div>

      {/* Center Tools / Status */}
      <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1 px-2">
         <span className="text-xs text-gray-400 font-mono w-16 text-center">{Math.round(canvasScale * 100)}%</span>
         <button onClick={() => handleZoomChange(Math.max(0.1, canvasScale - 0.1))} className="p-1 hover:text-white text-gray-400">
          <ZoomOut size={14} />
         </button>
         <button onClick={() => handleZoomChange(Math.min(5, canvasScale + 0.1))} className="p-1 hover:text-white text-gray-400">
          <ZoomIn size={14} />
         </button>
         <button onClick={() => handleZoomChange(1)} className="p-1 hover:text-white text-gray-400" title="重置缩放">
          <RotateCcw size={14} />
         </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-gray-400 hover:text-white rounded hover:bg-gray-800 p-2"
            title="清空画布"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
          {showClearConfirm && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 z-50 min-w-[160px]">
              <div className="text-sm text-gray-200 mb-3">确定清空?</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    clearCanvas();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  确定
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
