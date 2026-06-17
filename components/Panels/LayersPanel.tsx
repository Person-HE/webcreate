import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { useStore } from '../../store';

const BLEND_MODE_OPTIONS = ['正常', '正片叠底', '滤色', '叠加', '柔光'];

const LayersPanel = () => {
  const {
    layers,
    activeLayerId,
    setActiveLayer,
    toggleLayerVisibility,
    addLayer,
    duplicateLayer,
    updateLayer,
    removeLayer,
    moveLayer,
  } = useStore();

  const [editingOpacityId, setEditingOpacityId] = useState<string | null>(null);
  const [editingBlendModeId, setEditingBlendModeId] = useState<string | null>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-sm">图层</h3>
        <div className="flex space-x-1">
          <button onClick={addLayer} className="p-1.5 hover:bg-gray-700 rounded text-gray-400" title="新建图层">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {layers.map((layer) => (
            <div 
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`group relative flex items-center p-2 rounded-lg cursor-pointer transition-all border ${
                activeLayerId === layer.id 
                  ? 'bg-blue-900/30 border-blue-500/50' 
                  : 'bg-gray-800 border-transparent hover:bg-gray-800/80'
              }`}
            >
                <div className="w-12 h-12 bg-white rounded-md mr-3 flex-shrink-0 overflow-hidden relative border border-gray-700">
                   <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>
                   <div className="absolute top-1 left-1 text-xs text-gray-600 font-bold">
                     {layers.length - layers.indexOf(layer)}
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-bold text-xs opacity-50">
                     {layer.name[0]}
                   </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{layer.name}</div>
                  <div className="text-xs text-gray-500 flex items-center space-x-2 mt-0.5">
                    <span
                      className="cursor-pointer hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBlendModeId(editingBlendModeId === layer.id ? null : layer.id);
                        setEditingOpacityId(null);
                      }}
                    >
                      {layer.blendMode}
                    </span>
                    <span>•</span>
                    <span
                      className="cursor-pointer hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingOpacityId(editingOpacityId === layer.id ? null : layer.id);
                        setEditingBlendModeId(null);
                      }}
                    >
                      {layer.opacity}%
                    </span>
                  </div>
                  {editingBlendModeId === layer.id && (
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={layer.blendMode}
                        onChange={(e) => {
                          updateLayer(layer.id, { blendMode: e.target.value });
                          setEditingBlendModeId(null);
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                        autoFocus
                      >
                        {BLEND_MODE_OPTIONS.map((mode) => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {editingOpacityId === layer.id && (
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.opacity}
                        onChange={(e) => updateLayer(layer.id, { opacity: parseInt(e.target.value) })}
                        onMouseUp={() => setEditingOpacityId(null)}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 ml-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }}
                     className={`p-1 rounded hover:bg-gray-700 ${layers.indexOf(layer) === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400'}`}
                     title="上移图层"
                     disabled={layers.indexOf(layer) === 0}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }}
                     className={`p-1 rounded hover:bg-gray-700 ${layers.indexOf(layer) === layers.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400'}`}
                     title="下移图层"
                     disabled={layers.indexOf(layer) === layers.length - 1}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 5 7 7-7 7"/><path d="M5 12h14"/></svg>
                   </button>
                   
                   <button 
                     onClick={(e) => { e.stopPropagation(); duplicateLayer(); }}
                     className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                     title="复制图层"
                   >
                     <Copy size={14} />
                   </button>
                   
                   {layers.length > 1 && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); if (window.confirm('确定删除此图层？')) removeLayer(layer.id); }}
                       className="p-1 rounded hover:bg-gray-700 text-red-400 hover:text-red-300"
                       title="删除图层"
                     >
                       <Trash2 size={14} />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default LayersPanel;
