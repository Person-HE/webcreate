import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StoreProvider, useStore } from './store';
import Header from './components/Layout/Header';
import SidebarLeft from './components/Layout/SidebarLeft';
import Footer from './components/Layout/Footer';
import CanvasBoard from './components/Canvas/CanvasBoard';
import Toolbar from './components/Toolbar/Toolbar';
import WelcomeScreen from './components/WelcomeScreen';
import TemplateModal from './components/TemplateModal';
import AIDrawModal from './components/AIDrawModal';
import AISettingsModal from './components/AISettingsModal';
import ProjectManagerModal from './components/ProjectManagerModal';
import { TemplateData } from './data/templates';
import { AnimationTemplate } from './data/animationTemplates';
import { aiService } from './services/aiService';
import { AIProviderConfig, DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE_KEY } from './services/aiConfig';
import { createLLMClient } from './services/aiClient';
import { buildDrawingPrompt, parseAIResponse } from './services/aiPromptBuilder';
import { v4 as uuidv4 } from 'uuid';
import { Layer, ExcalidrawElement } from './types';

// Load AI config from localStorage
function loadAIConfig(): AIProviderConfig {
  try {
    const stored = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(stored) };
    }
  } catch {}
  return DEFAULT_AI_CONFIG;
}

const AppContent = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAIDrawModal, setShowAIDrawModal] = useState(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(loadAIConfig);
  const {
    setLayers, setElements, setFrames, setActiveLayerId,
    setAnimation, setAnimationFps,
    saveProject, currentProjectId, addProject, loadProjects,
  } = useStore();

  // Auto-save timer
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    if (currentProjectId) {
      autoSaveRef.current = setInterval(() => {
        saveProject();
      }, 30000);
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [currentProjectId, saveProject]);

  // Ctrl+S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentProjectId) {
          saveProject();
        } else {
          // No project yet, prompt to create one
          setShowProjectManager(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProjectId, saveProject]);

  // Auto-create project when user starts drawing (first element added)
  const ensureProject = useCallback(() => {
    if (!currentProjectId) {
      addProject('未命名作品');
    }
  }, [currentProjectId, addProject]);

  const handleSelectTemplate = useCallback((template: TemplateData) => {
    ensureProject();

    const newLayers = template.data.layers.map(l => ({
      id: uuidv4(),
      name: l.name,
      visible: l.visible,
      locked: false,
      opacity: 100,
      blendMode: '正常'
    }));

    const layerIdMap: Record<string, string> = {};
    template.data.layers.forEach((l, i) => {
      layerIdMap[l.id] = newLayers[i].id;
    });

    const newElements = template.data.layers.flatMap(l =>
      l.elements.map(el => ({
        ...el,
        id: uuidv4(),
        layerId: layerIdMap[l.id] || newLayers[0].id,
        angle: el.angle ?? 0,
        strokeColor: el.strokeColor ?? '#000000',
        backgroundColor: el.backgroundColor ?? 'transparent',
        fillStyle: (el.fillStyle as any) ?? 'none',
        strokeWidth: el.strokeWidth ?? 2,
        strokeStyle: (el.strokeStyle as any) ?? 'solid',
        roughness: el.roughness ?? 1,
        seed: el.seed ?? Math.floor(Math.random() * 100000),
        opacity: el.opacity ?? 100,
        cornerRadius: el.cornerRadius ?? 0,
        strokeSharpness: (el.strokeSharpness as any) ?? 'round',
        visible: true,
        locked: false,
      }))
    );

    setLayers(newLayers);
    setElements(newElements);
    setActiveLayerId(newLayers[0]?.id || '');
    setFrames([]);
    setShowWelcome(false);
    setShowTemplateModal(false);
  }, [setLayers, setElements, setFrames, setActiveLayerId, ensureProject]);

  const handleSelectAnimTemplate = useCallback(async (template: AnimationTemplate, brushSize?: number) => {
    ensureProject();
    const bs = brushSize || 2.5;

    const generatedFrames = template.generateFrames(1920, 1080);

    const newLayers: Layer[] = [];
    const allElements: ExcalidrawElement[] = [];

    generatedFrames.forEach((frameElements, index) => {
      const layerId = uuidv4();
      newLayers.push({
        id: layerId,
        name: `帧 ${index + 1}`,
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: '正常',
      });
      frameElements.forEach(el => {
        allElements.push({
          ...el,
          id: el.id || uuidv4(),
          layerId,
          strokeWidth: Math.max(1, (el.strokeWidth || 2) * (bs / 2.5)),
          visible: true,
          locked: false,
        });
      });
    });

    setLayers(newLayers);
    setElements(allElements);
    setFrames([]);
    setActiveLayerId(newLayers[0]?.id || '');
    setAnimation({ fps: template.fps, currentFrameIndex: 0 });
    setAnimationFps(template.fps);

    setShowWelcome(false);
    setShowTemplateModal(false);
  }, [setLayers, setElements, setFrames, setActiveLayerId, setAnimation, setAnimationFps, ensureProject]);

  // AI generation: supports both mock mode and real LLM API
  const handleAIGenerate = useCallback(async (prompt: string, brushSize: number) => {
    ensureProject();
    const canvasSize = { width: 1920, height: 1080 };

    if (aiConfig.type === 'mock') {
      const result = await aiService.generateDrawing(prompt, canvasSize);
      applyAIResult(result, brushSize);
      return;
    }

    const client = createLLMClient(aiConfig);
    const messages = buildDrawingPrompt(prompt, canvasSize);
    const response = await client.chat(messages);
    const result = parseAIResponse(response.content);
    applyAIResult(result, brushSize);
  }, [aiConfig, setLayers, setElements, setFrames, setActiveLayerId, ensureProject]);

  const applyAIResult = useCallback((
    result: {
      layers: Array<{
        id: string;
        name: string;
        visible: boolean;
        elements: any[];
      }>;
      description: string;
    },
    brushSize: number
  ) => {
    const newLayers = result.layers.map(l => ({
      id: uuidv4(),
      name: l.name,
      visible: l.visible,
      locked: false,
      opacity: 100,
      blendMode: '正常'
    }));

    const layerIdMap: Record<string, string> = {};
    result.layers.forEach((l, i) => {
      layerIdMap[l.id] = newLayers[i].id;
    });

    const newElements = result.layers.flatMap(l =>
      l.elements.map(el => ({
        ...el,
        id: uuidv4(),
        layerId: layerIdMap[l.id] || newLayers[0].id,
        angle: el.angle ?? 0,
        strokeColor: el.strokeColor ?? '#000000',
        backgroundColor: el.backgroundColor ?? 'transparent',
        fillStyle: (el.fillStyle as any) ?? 'none',
        strokeWidth: Math.max(1, (el.strokeWidth ?? 2) * (brushSize / 2.5)),
        strokeStyle: (el.strokeStyle as any) ?? 'solid',
        roughness: el.roughness ?? 1,
        seed: el.seed ?? Math.floor(Math.random() * 100000),
        opacity: el.opacity ?? 100,
        cornerRadius: el.cornerRadius ?? 0,
        strokeSharpness: (el.strokeSharpness as any) ?? 'round',
        visible: true,
        locked: false,
      }))
    );

    setLayers(newLayers);
    setElements(newElements);
    setActiveLayerId(newLayers[0]?.id || '');
    setFrames([]);
    setShowWelcome(false);
    setShowAIDrawModal(false);
  }, [setLayers, setElements, setFrames, setActiveLayerId]);

  const handleAIConfigChange = useCallback((config: AIProviderConfig) => {
    setAiConfig(config);
  }, []);

  const handleStartBlank = useCallback(() => {
    ensureProject();
    setShowWelcome(false);
  }, [ensureProject]);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden font-sans p-0 m-0">
      <Header
        onOpenTemplates={() => setShowTemplateModal(true)}
        onOpenAIDraw={() => setShowAIDrawModal(true)}
        onReopenWelcome={() => setShowWelcome(true)}
        onOpenProjectManager={() => setShowProjectManager(true)}
      />

      <main className="flex-1 relative overflow-hidden">
        <SidebarLeft />
        <Toolbar />
        <CanvasBoard />
      </main>

      <Footer onOpenTemplates={() => setShowTemplateModal(true)} />

      {/* Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen
          onSelectTemplate={() => setShowTemplateModal(true)}
          onAIDraw={() => setShowAIDrawModal(true)}
          onStartBlank={handleStartBlank}
        />
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
        onSelectAnimTemplate={handleSelectAnimTemplate}
      />

      {/* AI Draw Modal */}
      <AIDrawModal
        isOpen={showAIDrawModal}
        onClose={() => setShowAIDrawModal(false)}
        onGenerate={handleAIGenerate}
        onOpenSettings={() => {
          setShowAIDrawModal(false);
          setShowAISettingsModal(true);
        }}
        aiConfig={aiConfig}
      />

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={showAISettingsModal}
        onClose={() => setShowAISettingsModal(false)}
        config={aiConfig}
        onConfigChange={handleAIConfigChange}
      />

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={showProjectManager}
        onClose={() => setShowProjectManager(false)}
      />
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
