import React from 'react';
import { Layers, Palette, Brush as BrushIcon, X } from 'lucide-react';
import { useStore } from '../../store';
import LayersPanel from '../Panels/LayersPanel';
import BrushesPanel from '../Panels/BrushesPanel';
import ColorPanel from '../Panels/ColorPanel';

const SidebarLeft: React.FC = () => {
  const { activePanel, togglePanel } = useStore();

  const renderContent = (): React.ReactNode => {
    switch (activePanel) {
      case 'layers': return <LayersPanel />;
      case 'brushes': return <BrushesPanel />;
      case 'color': return <ColorPanel />;
      default: return null;
    }
  };

  return (
    <>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl p-2 shadow-2xl flex flex-col space-y-2">
        <button 
          onClick={() => togglePanel('layers')}
          className={`p-3 rounded-xl transition-all ${activePanel === 'layers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
          title="Layers"
        >
          <Layers size={22} />
        </button>
        <button 
          onClick={() => togglePanel('brushes')}
          className={`p-3 rounded-xl transition-all ${activePanel === 'brushes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
          title="Brushes"
        >
          <BrushIcon size={22} />
        </button>
        <button 
          onClick={() => togglePanel('color')}
          className={`p-3 rounded-xl transition-all ${activePanel === 'color' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
          title="Color"
        >
          <Palette size={22} />
        </button>
      </div>

      {activePanel !== 'none' && (
        <div className="fixed left-20 top-1/2 transform -translate-y-1/2 z-50 w-64 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out max-h-[80vh] overflow-hidden">
          <button 
            onClick={() => togglePanel('none')}
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors z-10"
            title="Close Panel"
          >
            <X size={16} />
          </button>
          
          <div className="pt-8 overflow-y-auto max-h-[80vh]">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarLeft;
