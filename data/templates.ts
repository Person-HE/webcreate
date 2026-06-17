// Template data for quick-start drawing
// Each template uses the same format as JSON import: { layers: [...] }

export interface TemplateData {
  id: string;
  name: string;
  category: 'social' | 'card' | 'diary' | 'fun' | 'business';
  description: string;
  tags: string[];
  data: {
    layers: Array<{
      id: string;
      name: string;
      visible: boolean;
      elements: Array<{
        id: string;
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
        angle?: number;
        strokeColor?: string;
        backgroundColor?: string;
        fillStyle?: string;
        strokeWidth?: number;
        strokeStyle?: string;
        roughness?: number;
        seed?: number;
        opacity?: number;
        cornerRadius?: number;
        layerId?: string;
        strokeSharpness?: string;
        text?: string;
        fontSize?: number;
        fontFamily?: string;
        textAlign?: string;
        points?: [number, number, number][];
      }>;
    }>;
  };
}

// Helper to generate unique seeds
const seed = () => Math.floor(Math.random() * 100000);

export const TEMPLATES: TemplateData[] = [
  // ============ Social ============
  {
    id: 'social-mood-card',
    name: '心情卡片',
    category: 'social',
    description: '分享今日心情',
    tags: ['心情', '社交', '卡片'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 360, y: 140, width: 1200, height: 800, strokeColor: '#3b82f6', backgroundColor: '#eff6ff', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 20, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'title', type: 'text', x: 560, y: 240, width: 800, height: 60, strokeColor: '#1e3a5f', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '今日心情', fontSize: 48, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'line1', type: 'line', x: 460, y: 340, width: 1000, height: 0, strokeColor: '#93c5fd', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'dashed', roughness: 1, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'mood', type: 'text', x: 560, y: 400, width: 800, height: 200, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '在这里写下你的心情...\n\n今天的你，辛苦了。', fontSize: 28, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'deco1', type: 'ellipse', x: 420, y: 180, width: 80, height: 80, strokeColor: '#fbbf24', backgroundColor: '#fef3c7', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'deco2', type: 'ellipse', x: 1420, y: 820, width: 60, height: 60, strokeColor: '#f472b6', backgroundColor: '#fce7f3', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'date', type: 'text', x: 560, y: 780, width: 800, height: 40, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: new Date().toLocaleDateString('zh-CN'), fontSize: 20, fontFamily: 'Virgil', textAlign: 'center' },
        ]
      }]
    }
  },
  {
    id: 'social-quote',
    name: '每日一句',
    category: 'social',
    description: '分享励志语录',
    tags: ['语录', '励志', '社交'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 360, y: 140, width: 1200, height: 800, strokeColor: '#8b5cf6', backgroundColor: '#1a1a2e', fillStyle: 'solid', strokeWidth: 0, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 20, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'quote-mark', type: 'text', x: 440, y: 220, width: 100, height: 80, strokeColor: '#8b5cf6', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 40, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '"', fontSize: 80, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'quote', type: 'text', x: 500, y: 320, width: 920, height: 300, strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '生活不是等待暴风雨过去，\n而是学会在雨中翩翩起舞。', fontSize: 36, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'author', type: 'text', x: 500, y: 650, width: 920, height: 40, strokeColor: '#a78bfa', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '— Vivian Greene', fontSize: 22, fontFamily: 'Virgil', textAlign: 'right' },
          { id: 'line1', type: 'line', x: 760, y: 620, width: 400, height: 0, strokeColor: '#8b5cf6', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 30, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
        ]
      }]
    }
  },
  {
    id: 'social-thanks-card',
    name: '感谢卡',
    category: 'card',
    description: '表达感谢之情',
    tags: ['感谢', '卡片', '温暖'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 360, y: 140, width: 1200, height: 800, strokeColor: '#f59e0b', backgroundColor: '#fffbeb', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 20, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'heart', type: 'text', x: 860, y: 240, width: 200, height: 120, strokeColor: '#ef4444', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '❤', fontSize: 80, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'title', type: 'text', x: 560, y: 380, width: 800, height: 60, strokeColor: '#92400e', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '谢谢你', fontSize: 48, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'msg', type: 'text', x: 560, y: 480, width: 800, height: 200, strokeColor: '#78350f', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '感谢你一直以来的陪伴和支持，\n有你在真好。', fontSize: 28, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'deco1', type: 'ellipse', x: 420, y: 200, width: 40, height: 40, strokeColor: '#fbbf24', backgroundColor: '#fde68a', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 70, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'deco2', type: 'ellipse', x: 1460, y: 200, width: 30, height: 30, strokeColor: '#fb923c', backgroundColor: '#fed7aa', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 70, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
        ]
      }]
    }
  },
  {
    id: 'social-birthday',
    name: '生日贺卡',
    category: 'card',
    description: '生日快乐祝福',
    tags: ['生日', '祝福', '贺卡'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 360, y: 140, width: 1200, height: 800, strokeColor: '#ec4899', backgroundColor: '#fdf2f8', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 20, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'title', type: 'text', x: 560, y: 260, width: 800, height: 80, strokeColor: '#be185d', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '生日快乐！', fontSize: 56, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'cake', type: 'text', x: 810, y: 380, width: 300, height: 120, strokeColor: '#ec4899', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '🎂', fontSize: 80, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'msg', type: 'text', x: 560, y: 540, width: 800, height: 120, strokeColor: '#4b5563', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '愿你年年有今日，岁岁有今朝，\n每一天都充满快乐和惊喜！', fontSize: 26, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'confetti1', type: 'diamond', x: 440, y: 200, width: 30, height: 30, strokeColor: '#f472b6', backgroundColor: '#fbcfe8', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'confetti2', type: 'diamond', x: 1400, y: 300, width: 24, height: 24, strokeColor: '#a78bfa', backgroundColor: '#c4b5fd', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'confetti3', type: 'ellipse', x: 500, y: 700, width: 20, height: 20, strokeColor: '#34d399', backgroundColor: '#a7f3d0', fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid', roughness: 2, seed: seed(), opacity: 70, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
        ]
      }]
    }
  },

  // ============ Diary ============
  {
    id: 'diary-daily-plan',
    name: '每日计划',
    category: 'diary',
    description: '规划你的一天',
    tags: ['计划', '日记', '效率'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 360, y: 100, width: 1200, height: 880, strokeColor: '#d1d5db', backgroundColor: '#fefce8', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'title', type: 'text', x: 440, y: 140, width: 600, height: 50, strokeColor: '#1f2937', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '每日计划', fontSize: 36, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'date', type: 'text', x: 1200, y: 150, width: 300, height: 30, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: new Date().toLocaleDateString('zh-CN'), fontSize: 20, fontFamily: 'Virgil', textAlign: 'right' },
          { id: 'line1', type: 'line', x: 440, y: 210, width: 1040, height: 0, strokeColor: '#d1d5db', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'task1', type: 'text', x: 440, y: 240, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  09:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'task2', type: 'text', x: 440, y: 310, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  10:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'task3', type: 'text', x: 440, y: 380, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  11:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'task4', type: 'text', x: 440, y: 450, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  14:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'task5', type: 'text', x: 440, y: 520, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  15:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'task6', type: 'text', x: 440, y: 590, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  16:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'task7', type: 'text', x: 440, y: 660, width: 800, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  17:00  ', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'notes-label', type: 'text', x: 440, y: 750, width: 200, height: 30, strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '备注：', fontSize: 18, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'notes-line', type: 'line', x: 440, y: 800, width: 1040, height: 0, strokeColor: '#e5e7eb', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'dashed', roughness: 0, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
        ]
      }]
    }
  },
  {
    id: 'diary-mood-journal',
    name: '心情日记',
    category: 'diary',
    description: '记录今天的故事',
    tags: ['日记', '心情', '记录'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 360, y: 100, width: 1200, height: 880, strokeColor: '#a78bfa', backgroundColor: '#faf5ff', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 12, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'date', type: 'text', x: 440, y: 140, width: 400, height: 40, strokeColor: '#7c3aed', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), fontSize: 24, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'weather', type: 'text', x: 1300, y: 140, width: 200, height: 40, strokeColor: '#a78bfa', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '天气：☀️', fontSize: 20, fontFamily: 'Virgil', textAlign: 'right' },
          { id: 'line1', type: 'line', x: 440, y: 200, width: 1040, height: 0, strokeColor: '#ddd6fe', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'mood-label', type: 'text', x: 440, y: 230, width: 200, height: 30, strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '今日心情：', fontSize: 18, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'mood', type: 'text', x: 600, y: 220, width: 200, height: 40, strokeColor: '#ec4899', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '😊 开心', fontSize: 24, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'line2', type: 'line', x: 440, y: 280, width: 1040, height: 0, strokeColor: '#ddd6fe', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'content', type: 'text', x: 440, y: 310, width: 1040, height: 500, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '今天发生了什么？\n\n在这里写下你的故事...\n\n\n\n\n\n\n', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
        ]
      }]
    }
  },

  // ============ Fun ============
  {
    id: 'fun-meme-top-bottom',
    name: '表情包模板',
    category: 'fun',
    description: '经典上下文字表情包',
    tags: ['表情包', '搞笑', 'meme'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 460, y: 190, width: 1000, height: 700, strokeColor: '#000000', backgroundColor: '#ffffff', fillStyle: 'solid', strokeWidth: 4, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'top-text', type: 'text', x: 500, y: 220, width: 920, height: 80, strokeColor: '#000000', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '当你...', fontSize: 48, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'img-placeholder', type: 'rectangle', x: 560, y: 340, width: 800, height: 380, strokeColor: '#d1d5db', backgroundColor: '#f3f4f6', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'dashed', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'img-hint', type: 'text', x: 760, y: 500, width: 400, height: 40, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '在这里插入图片', fontSize: 24, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'bottom-text', type: 'text', x: 500, y: 760, width: 920, height: 80, strokeColor: '#000000', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '写上你的文字', fontSize: 48, fontFamily: 'Virgil', textAlign: 'center' },
        ]
      }]
    }
  },
  {
    id: 'fun-comic-strip',
    name: '漫画四格',
    category: 'fun',
    description: '四格漫画模板',
    tags: ['漫画', '四格', '故事'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'title', type: 'text', x: 660, y: 60, width: 600, height: 50, strokeColor: '#1f2937', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '四格漫画', fontSize: 32, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'panel1', type: 'rectangle', x: 360, y: 130, width: 580, height: 380, strokeColor: '#374151', backgroundColor: '#ffffff', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 4, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'panel2', type: 'rectangle', x: 980, y: 130, width: 580, height: 380, strokeColor: '#374151', backgroundColor: '#ffffff', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 4, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'panel3', type: 'rectangle', x: 360, y: 550, width: 580, height: 380, strokeColor: '#374151', backgroundColor: '#ffffff', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 4, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'panel4', type: 'rectangle', x: 980, y: 550, width: 580, height: 380, strokeColor: '#374151', backgroundColor: '#ffffff', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 4, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'num1', type: 'text', x: 380, y: 140, width: 40, height: 30, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '1', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'num2', type: 'text', x: 1000, y: 140, width: 40, height: 30, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '2', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'num3', type: 'text', x: 380, y: 560, width: 40, height: 30, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '3', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'num4', type: 'text', x: 1000, y: 560, width: 40, height: 30, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 60, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '4', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
        ]
      }]
    }
  },
  {
    id: 'fun-ranking',
    name: '排行榜',
    category: 'fun',
    description: '趣味排行榜模板',
    tags: ['排行', '对比', '趣味'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 460, y: 140, width: 1000, height: 800, strokeColor: '#f59e0b', backgroundColor: '#1c1917', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 16, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'title', type: 'text', x: 660, y: 180, width: 600, height: 60, strokeColor: '#fbbf24', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: 'TOP 排行榜', fontSize: 40, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'line1', type: 'line', x: 540, y: 260, width: 840, height: 0, strokeColor: '#fbbf24', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 30, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'rank1', type: 'text', x: 540, y: 300, width: 800, height: 50, strokeColor: '#fbbf24', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '🥇 第一名', fontSize: 32, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'rank2', type: 'text', x: 540, y: 400, width: 800, height: 50, strokeColor: '#d1d5db', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '🥈 第二名', fontSize: 28, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'rank3', type: 'text', x: 540, y: 490, width: 800, height: 50, strokeColor: '#d97706', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '🥉 第三名', fontSize: 26, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'rank4', type: 'text', x: 540, y: 570, width: 800, height: 50, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '4. 第四名', fontSize: 24, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'rank5', type: 'text', x: 540, y: 640, width: 800, height: 50, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '5. 第五名', fontSize: 24, fontFamily: 'Virgil', textAlign: 'left' },
        ]
      }]
    }
  },

  // ============ Business ============
  {
    id: 'business-flowchart',
    name: '流程图',
    category: 'business',
    description: '简洁的流程图模板',
    tags: ['流程图', '工作', '商务'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'start', type: 'ellipse', x: 810, y: 120, width: 300, height: 80, strokeColor: '#3b82f6', backgroundColor: '#dbeafe', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'start-text', type: 'text', x: 860, y: 135, width: 200, height: 50, strokeColor: '#1e40af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '开始', fontSize: 24, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'arrow1', type: 'arrow', x: 960, y: 200, width: 0, height: 80, strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'step1', type: 'rectangle', x: 760, y: 280, width: 400, height: 80, strokeColor: '#3b82f6', backgroundColor: '#eff6ff', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'step1-text', type: 'text', x: 810, y: 295, width: 300, height: 50, strokeColor: '#1e3a5f', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '步骤一', fontSize: 22, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'arrow2', type: 'arrow', x: 960, y: 360, width: 0, height: 80, strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'step2', type: 'rectangle', x: 760, y: 440, width: 400, height: 80, strokeColor: '#3b82f6', backgroundColor: '#eff6ff', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'step2-text', type: 'text', x: 810, y: 455, width: 300, height: 50, strokeColor: '#1e3a5f', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '步骤二', fontSize: 22, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'arrow3', type: 'arrow', x: 960, y: 520, width: 0, height: 80, strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'step3', type: 'diamond', x: 810, y: 600, width: 300, height: 120, strokeColor: '#f59e0b', backgroundColor: '#fef3c7', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'step3-text', type: 'text', x: 860, y: 630, width: 200, height: 50, strokeColor: '#92400e', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '判断', fontSize: 22, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'arrow4', type: 'arrow', x: 960, y: 720, width: 0, height: 80, strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'end', type: 'ellipse', x: 810, y: 800, width: 300, height: 80, strokeColor: '#10b981', backgroundColor: '#d1fae5', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'end-text', type: 'text', x: 860, y: 815, width: 200, height: 50, strokeColor: '#065f46', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '完成', fontSize: 24, fontFamily: 'Virgil', textAlign: 'center' },
        ]
      }]
    }
  },
  {
    id: 'business-mindmap',
    name: '思维导图',
    category: 'business',
    description: '头脑风暴思维导图',
    tags: ['思维导图', '头脑风暴', '创意'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'center', type: 'ellipse', x: 760, y: 410, width: 400, height: 120, strokeColor: '#8b5cf6', backgroundColor: '#ede9fe', fillStyle: 'solid', strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'center-text', type: 'text', x: 860, y: 440, width: 200, height: 50, strokeColor: '#5b21b6', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '核心主题', fontSize: 28, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'branch1-line', type: 'line', x: 660, y: 430, width: -200, height: -150, strokeColor: '#3b82f6', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch1', type: 'rectangle', x: 310, y: 230, width: 200, height: 60, strokeColor: '#3b82f6', backgroundColor: '#dbeafe', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch1-text', type: 'text', x: 330, y: 240, width: 160, height: 40, strokeColor: '#1e40af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '分支一', fontSize: 20, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'branch2-line', type: 'line', x: 1260, y: 430, width: 200, height: -150, strokeColor: '#10b981', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch2', type: 'rectangle', x: 1410, y: 230, width: 200, height: 60, strokeColor: '#10b981', backgroundColor: '#d1fae5', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch2-text', type: 'text', x: 1430, y: 240, width: 160, height: 40, strokeColor: '#065f46', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '分支二', fontSize: 20, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'branch3-line', type: 'line', x: 660, y: 510, width: -200, height: 150, strokeColor: '#f59e0b', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch3', type: 'rectangle', x: 310, y: 610, width: 200, height: 60, strokeColor: '#f59e0b', backgroundColor: '#fef3c7', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch3-text', type: 'text', x: 330, y: 620, width: 160, height: 40, strokeColor: '#92400e', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '分支三', fontSize: 20, fontFamily: 'Virgil', textAlign: 'center' },
          { id: 'branch4-line', type: 'line', x: 1260, y: 510, width: 200, height: 150, strokeColor: '#ef4444', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 80, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch4', type: 'rectangle', x: 1410, y: 610, width: 200, height: 60, strokeColor: '#ef4444', backgroundColor: '#fee2e2', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'branch4-text', type: 'text', x: 1430, y: 620, width: 160, height: 40, strokeColor: '#991b1b', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '分支四', fontSize: 20, fontFamily: 'Virgil', textAlign: 'center' },
        ]
      }]
    }
  },
  {
    id: 'business-whiteboard',
    name: '会议白板',
    category: 'business',
    description: '会议记录白板',
    tags: ['会议', '白板', '记录'],
    data: {
      layers: [{
        id: 'layer-1',
        name: '背景',
        visible: true,
        elements: [
          { id: 'bg', type: 'rectangle', x: 310, y: 80, width: 1300, height: 920, strokeColor: '#d1d5db', backgroundColor: '#f9fafb', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 8, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'title', type: 'text', x: 400, y: 110, width: 600, height: 50, strokeColor: '#1f2937', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '会议记录', fontSize: 32, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'date', type: 'text', x: 1300, y: 120, width: 250, height: 30, strokeColor: '#9ca3af', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: new Date().toLocaleDateString('zh-CN'), fontSize: 18, fontFamily: 'Virgil', textAlign: 'right' },
          { id: 'divider', type: 'line', x: 400, y: 180, width: 1120, height: 0, strokeColor: '#e5e7eb', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round' },
          { id: 'topic-label', type: 'text', x: 400, y: 210, width: 200, height: 30, strokeColor: '#3b82f6', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '📋 议题', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'topic', type: 'text', x: 400, y: 260, width: 1120, height: 40, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '', fontSize: 22, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'notes-label', type: 'text', x: 400, y: 340, width: 200, height: 30, strokeColor: '#10b981', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '📝 要点', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'notes', type: 'text', x: 400, y: 390, width: 1120, height: 250, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '1. \n2. \n3. \n4. \n5. ', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'action-label', type: 'text', x: 400, y: 680, width: 200, height: 30, strokeColor: '#f59e0b', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '✅ 待办', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
          { id: 'actions', type: 'text', x: 400, y: 730, width: 1120, height: 200, strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none', strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: seed(), opacity: 100, cornerRadius: 0, layerId: 'layer-1', strokeSharpness: 'round', text: '☐  \n☐  \n☐  ', fontSize: 20, fontFamily: 'Virgil', textAlign: 'left' },
        ]
      }]
    }
  },
];

// Category display names
export const CATEGORY_NAMES: Record<string, string> = {
  social: '社交配图',
  card: '贺卡',
  diary: '日记手帐',
  fun: '趣味',
  business: '商务',
};

// Get templates by category
export const getTemplatesByCategory = (category: string) =>
  TEMPLATES.filter(t => t.category === category);

// Get all categories
export const getAllCategories = () =>
  [...new Set(TEMPLATES.map(t => t.category))];
