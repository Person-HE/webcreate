import { v4 as uuidv4 } from 'uuid';
import { ExcalidrawElement } from '../types';
import { AnimationEasingConfig } from '../utils/tweenAnimation';

export interface AnimationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'text' | 'shape' | 'scene' | 'fun';
  fps: number;
  easingConfig: AnimationEasingConfig;
  generateFrames: (canvasWidth: number, canvasHeight: number) => ExcalidrawElement[][];
}

const rand = () => Math.floor(Math.random() * 100000);

const textEl = (
  id: string, x: number, y: number, text: string,
  opts: Partial<ExcalidrawElement> = {}
): ExcalidrawElement => ({
  id,
  type: 'text',
  x, y,
  width: text.length * 24,
  height: 40,
  angle: 0,
  strokeColor: '#ffffff',
  backgroundColor: 'transparent',
  fillStyle: 'none',
  strokeWidth: 1,
  strokeStyle: 'solid',
  roughness: 0,
  seed: rand(),
  visible: true,
  locked: false,
  opacity: 100,
  cornerRadius: 0,
  layerId: '',
  strokeSharpness: 'round',
  text,
  fontSize: 32,
  fontFamily: 'Virgil',
  textAlign: 'center',
  ...opts,
});

const rectEl = (
  id: string, x: number, y: number, w: number, h: number,
  opts: Partial<ExcalidrawElement> = {}
): ExcalidrawElement => ({
  id,
  type: 'rectangle',
  x, y, width: w, height: h,
  angle: 0,
  strokeColor: '#3b82f6',
  backgroundColor: '#dbeafe',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  seed: rand(),
  visible: true,
  locked: false,
  opacity: 100,
  cornerRadius: 8,
  layerId: '',
  strokeSharpness: 'round',
  ...opts,
});

const ellipseEl = (
  id: string, x: number, y: number, w: number, h: number,
  opts: Partial<ExcalidrawElement> = {}
): ExcalidrawElement => ({
  id,
  type: 'ellipse',
  x, y, width: w, height: h,
  angle: 0,
  strokeColor: '#ef4444',
  backgroundColor: '#fca5a5',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  seed: rand(),
  visible: true,
  locked: false,
  opacity: 100,
  cornerRadius: 0,
  layerId: '',
  strokeSharpness: 'round',
  ...opts,
});

const diamondEl = (
  id: string, x: number, y: number, w: number, h: number,
  opts: Partial<ExcalidrawElement> = {}
): ExcalidrawElement => ({
  id,
  type: 'diamond',
  x, y, width: w, height: h,
  angle: 0,
  strokeColor: '#f59e0b',
  backgroundColor: '#fde68a',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  seed: rand(),
  visible: true,
  locked: false,
  opacity: 100,
  cornerRadius: 0,
  layerId: '',
  strokeSharpness: 'round',
  ...opts,
});


export const ANIMATION_TEMPLATES: AnimationTemplate[] = [

  {
    id: 'anim-bounce-text',
    name: '弹跳文字',
    description: '文字从上方掉落并弹跳，模拟真实重力',
    category: 'text',
    fps: 30,
    easingConfig: {
      position: 'gravity',
      scale: 'easeOutBack',
      opacity: 'easeOutSine',
      gravityConfig: { gravity: 9.8, bounceRestitution: 0.5, initialHeight: 1, groundLevel: 0 },
      trail: { enabled: true, trailCount: 3, trailDecay: 0.5, speedThreshold: 30 },
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 30;
      const text = 'Hello!';
      const cx = cw / 2 - 100;
      const groundY = ch / 2;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const bounceT = (() => {
          const g = 9.8;
          const scale = 3;
          const gt = t * scale;
          const fallTime = Math.sqrt(2 / g);
          if (gt <= fallTime) return 1 - (0.5 * g * gt * gt);
          let currentTime = fallTime;
          let bounceV = Math.sqrt(2 * g) * 0.5;
          for (let b = 0; b < 8; b++) {
            const bounceTime = 2 * bounceV / g;
            if (gt <= currentTime + bounceTime) {
              const localT = gt - currentTime;
              const halfBounce = bounceV / g;
              if (localT <= halfBounce) {
                return bounceV * localT - 0.5 * g * localT * localT;
              } else {
                const fallT = localT - halfBounce;
                const peakH = bounceV * halfBounce - 0.5 * g * halfBounce * halfBounce;
                return peakH - 0.5 * g * fallT * fallT;
              }
            }
            currentTime += bounceTime;
            bounceV *= 0.5;
            if (bounceV < 0.05) break;
          }
          return 0;
        })();

        const y = groundY - bounceT * (groundY - 100);
        const scale = bounceT < 0.1 ? 0.5 + bounceT * 5 : 1;

        frames.push([
          {
            ...textEl('t1', cx, y, text, {
              fontSize: Math.round(32 * scale),
              width: text.length * 24 * scale,
              height: 40 * scale,
              strokeColor: '#3b82f6',
            }),
            layerId: `frame-${i}`,
          }
        ]);
      }
      return frames;
    }
  },

  {
    id: 'anim-spring-in',
    name: '弹入图形',
    description: '图形从无到有弹入，弹簧物理回弹效果',
    category: 'shape',
    fps: 30,
    easingConfig: {
      position: 'spring',
      scale: 'spring',
      opacity: 'easeOutSine',
      springConfig: { mass: 1, stiffness: 180, damping: 12 },
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 25;
      const cx = cw / 2;
      const cy = ch / 2;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const omega_n = Math.sqrt(180);
        const zeta = 12 / (2 * Math.sqrt(180));
        const omega_d = omega_n * Math.sqrt(1 - zeta * zeta);
        const decay = Math.exp(-zeta * omega_n * t);
        const springVal = 1 - decay * (Math.cos(omega_d * t) + (zeta * omega_n / omega_d) * Math.sin(omega_d * t));

        const scale = Math.max(0, springVal);
        const w = 120 * scale;
        const h = 120 * scale;

        frames.push([
          rectEl('s1', cx - w / 2, cy - h / 2, w, h, {
            strokeColor: '#8b5cf6',
            backgroundColor: '#ede9fe',
            cornerRadius: Math.round(16 * scale),
            layerId: `frame-${i}`,
          }),
          ellipseEl('s2', cx - w / 2 - 80 * scale, cy - 30 * scale, 60 * scale, 60 * scale, {
            strokeColor: '#10b981',
            backgroundColor: '#d1fae5',
            layerId: `frame-${i}`,
          }),
          diamondEl('s3', cx + w / 2 + 20 * scale, cy - 30 * scale, 60 * scale, 60 * scale, {
            strokeColor: '#f59e0b',
            backgroundColor: '#fde68a',
            layerId: `frame-${i}`,
          }),
        ]);
      }
      return frames;
    }
  },

  {
    id: 'anim-heartbeat',
    name: '心跳',
    description: '心形周期性缩放，弹性效果',
    category: 'shape',
    fps: 24,
    easingConfig: {
      scale: 'easeOutElastic',
      opacity: 'easeInOutSine',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 36;
      const cx = cw / 2;
      const cy = ch / 2;
      const baseSize = 100;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const cycle = (t * 2) % 1;
        let pulse: number;
        if (cycle < 0.15) {
          pulse = 1 + 0.3 * Math.sin(cycle / 0.15 * Math.PI);
        } else if (cycle < 0.25) {
          pulse = 1;
        } else if (cycle < 0.4) {
          pulse = 1 + 0.15 * Math.sin((cycle - 0.25) / 0.15 * Math.PI);
        } else {
          pulse = 1;
        }

        const size = baseSize * pulse;
        const halfSize = size / 2;

        const heartPts: [number, number, number][] = [];
        for (let a = 0; a <= 60; a++) {
          const angle = (a / 60) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(angle), 3);
          const hy = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
          heartPts.push([
            cx + hx * (size / 30),
            cy + hy * (size / 30),
            0.8
          ]);
        }

        frames.push([
          {
            id: 'heart',
            type: 'free_draw',
            x: cx - halfSize, y: cy - halfSize,
            width: size, height: size,
            angle: 0,
            strokeColor: '#ef4444',
            backgroundColor: '#fca5a5',
            fillStyle: 'solid',
            strokeWidth: 3,
            strokeStyle: 'solid',
            roughness: 1,
            seed: 42,
            visible: true,
            locked: false,
            opacity: 100,
            cornerRadius: 0,
            layerId: `frame-${i}`,
            strokeSharpness: 'round',
            points: heartPts,
          } as any
        ]);
      }
      return frames;
    }
  },

  {
    id: 'anim-falling-leaf',
    name: '飘落树叶',
    description: '树叶在重力和风力作用下飘落，慢进慢出',
    category: 'scene',
    fps: 24,
    easingConfig: {
      position: 'easeInOutSine',
      rotation: 'easeInOutCubic',
      opacity: 'easeInOutSine',
      trail: { enabled: true, trailCount: 4, trailDecay: 0.4, speedThreshold: 20 },
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 40;
      const startX = cw / 2;
      const startY = 100;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;

        const easedT = (() => {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        })();
        const y = startY + easedT * (ch - 200);
        const sway = Math.sin(t * Math.PI * 4) * 80;
        const x = startX + sway;
        const rotation = Math.sin(t * Math.PI * 3) * 30;

        const leafPts: [number, number, number][] = [];
        const leafSize = 30;
        for (let a = 0; a <= 30; a++) {
          const angle = (a / 30) * Math.PI * 2;
          const lr = leafSize * (0.5 + 0.5 * Math.abs(Math.cos(angle)));
          leafPts.push([
            x + Math.cos(angle) * lr,
            y + Math.sin(angle) * lr * 0.6,
            0.7
          ]);
        }

        frames.push([
          {
            id: 'leaf',
            type: 'free_draw',
            x: x - leafSize, y: y - leafSize,
            width: leafSize * 2, height: leafSize * 2,
            angle: rotation,
            strokeColor: '#16a34a',
            backgroundColor: '#86efac',
            fillStyle: 'solid',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: 2,
            seed: 42,
            visible: true,
            locked: false,
            opacity: 90,
            cornerRadius: 0,
            layerId: `frame-${i}`,
            strokeSharpness: 'round',
            points: leafPts,
          } as any
        ]);
      }
      return frames;
    }
  },

  {
    id: 'anim-water-ripple',
    name: '水波纹',
    description: '同心圆水波向外扩散并衰减，慢出缓动',
    category: 'scene',
    fps: 24,
    easingConfig: {
      scale: 'easeOutCubic',
      opacity: 'easeOutSine',
      position: 'easeOutCubic',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 30;
      const cx = cw / 2;
      const cy = ch / 2;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const elements: ExcalidrawElement[] = [];

        for (let r = 0; r < 4; r++) {
          const rippleT = (t + r * 0.2) % 1;
          const easedRippleT = 1 - Math.pow(1 - rippleT, 3);
          const radius = easedRippleT * 200;
          const opacity = Math.max(0, 100 - rippleT * 120);

          if (radius > 5) {
            const pts: [number, number, number][] = [];
            for (let a = 0; a <= 40; a++) {
              const angle = (a / 40) * Math.PI * 2;
              pts.push([
                cx + Math.cos(angle) * radius,
                cy + Math.sin(angle) * radius,
                0.6
              ]);
            }

            elements.push({
              id: `ripple-${r}`,
              type: 'free_draw',
              x: cx - radius, y: cy - radius,
              width: radius * 2, height: radius * 2,
              angle: 0,
              strokeColor: '#3b82f6',
              backgroundColor: 'transparent',
              fillStyle: 'none',
              strokeWidth: 2,
              strokeStyle: 'solid',
              roughness: 1,
              seed: 42,
              visible: true,
              locked: false,
              opacity: Math.round(opacity),
              cornerRadius: 0,
              layerId: `frame-${i}`,
              strokeSharpness: 'round',
              points: pts,
            } as any);
          }
        }

        elements.push(
          ellipseEl('dot', cx - 5, cy - 5, 10, 10, {
            strokeColor: '#3b82f6',
            backgroundColor: '#93c5fd',
            opacity: Math.round(100 - t * 80),
            layerId: `frame-${i}`,
          })
        );

        frames.push(elements);
      }
      return frames;
    }
  },

  {
    id: 'anim-typewriter',
    name: '打字机',
    description: '逐字打出文字，慢进慢出回弹',
    category: 'text',
    fps: 20,
    easingConfig: {
      position: 'easeOutBack',
      opacity: 'easeOutSine',
      scale: 'easeOutBack',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const text = 'Hello World!';
      const totalFrames = text.length + 5;
      const cx = cw / 2 - 200;
      const cy = ch / 2;

      for (let i = 0; i <= totalFrames; i++) {
        const charsToShow = Math.min(i, text.length);
        const displayText = text.slice(0, charsToShow);
        const cursorVisible = i <= text.length;

        const elements: ExcalidrawElement[] = [];

        if (displayText) {
          elements.push(
            textEl('typed', cx, cy, displayText, {
              fontSize: 36,
              strokeColor: '#1f2937',
              width: displayText.length * 22,
              layerId: `frame-${i}`,
            })
          );
        }

        if (cursorVisible) {
          const cursorX = cx + charsToShow * 22;
          elements.push(
            rectEl('cursor', cursorX, cy, 3, 36, {
              strokeColor: 'transparent',
              backgroundColor: '#3b82f6',
              strokeWidth: 0,
              layerId: `frame-${i}`,
            })
          );
        }

        if (i > 0 && i <= text.length) {
          const popChar = text[i - 1];
          const popX = cx + (i - 1) * 22;
          const popProgress = ((i - 1) % 3) / 3;
          const popScale = 1 + 0.3 * Math.sin(popProgress * Math.PI);

          elements.push(
            textEl(`pop-${i}`, popX, cy - 5 * popScale, popChar, {
              fontSize: Math.round(36 * popScale),
              strokeColor: '#3b82f6',
              opacity: Math.round(60 * (1 - popProgress)),
              width: 30,
              layerId: `frame-${i}`,
            })
          );
        }

        frames.push(elements);
      }
      return frames;
    }
  },

  {
    id: 'anim-sunrise',
    name: '日出',
    description: '太阳缓缓升起，天空变亮，慢进慢出',
    category: 'scene',
    fps: 24,
    easingConfig: {
      position: 'easeInOutCubic',
      opacity: 'easeInOutSine',
      scale: 'easeOutCubic',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 40;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const sunY = ch * 0.7 - easedT * ch * 0.4;
        const sunX = cw / 2;
        const brightness = Math.round(easedT * 60);

        const skyColor = `rgb(${135 + brightness}, ${206 + Math.round(brightness * 0.3)}, ${235 + Math.round(brightness * 0.1)})`;

        const elements: ExcalidrawElement[] = [];

        elements.push(
          rectEl('sky', 0, 0, cw, ch, {
            strokeColor: 'transparent',
            backgroundColor: skyColor,
            strokeWidth: 0,
            cornerRadius: 0,
            layerId: `frame-${i}`,
          })
        );

        elements.push(
          rectEl('ground', 0, ch * 0.65, cw, ch * 0.35, {
            strokeColor: 'transparent',
            backgroundColor: '#22543d',
            strokeWidth: 0,
            cornerRadius: 0,
            layerId: `frame-${i}`,
          })
        );

        const sunSize = 80 + easedT * 20;
        elements.push(
          ellipseEl('sun', sunX - sunSize / 2, sunY - sunSize / 2, sunSize, sunSize, {
            strokeColor: '#f59e0b',
            backgroundColor: '#fcd34d',
            opacity: Math.round(70 + easedT * 30),
            layerId: `frame-${i}`,
          })
        );

        for (let r = 0; r < 8; r++) {
          const angle = (r / 8) * Math.PI * 2;
          const rayLen = 30 + easedT * 40;
          const rayPts: [number, number, number][] = [
            [sunX + Math.cos(angle) * (sunSize / 2 + 5), sunY + Math.sin(angle) * (sunSize / 2 + 5), 0.8],
            [sunX + Math.cos(angle) * (sunSize / 2 + rayLen), sunY + Math.sin(angle) * (sunSize / 2 + rayLen), 0.5],
          ];
          elements.push({
            id: `ray-${r}`,
            type: 'free_draw',
            x: sunX - sunSize, y: sunY - sunSize,
            width: sunSize * 2, height: sunSize * 2,
            angle: 0,
            strokeColor: '#fbbf24',
            backgroundColor: 'transparent',
            fillStyle: 'none',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: 2,
            seed: 42,
            visible: true,
            locked: false,
            opacity: Math.round(40 + easedT * 40),
            cornerRadius: 0,
            layerId: `frame-${i}`,
            strokeSharpness: 'round',
            points: rayPts,
          } as any);
        }

        frames.push(elements);
      }
      return frames;
    }
  },

  {
    id: 'anim-twinkling-stars',
    name: '闪烁星星',
    description: '星星随机闪烁，弹性缩放，慢进慢出',
    category: 'scene',
    fps: 20,
    easingConfig: {
      scale: 'easeOutElastic',
      opacity: 'easeInOutSine',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 30;

      const stars = Array.from({ length: 12 }, (_, i) => ({
        x: 100 + (i * 137) % (cw - 200),
        y: 50 + (i * 89) % (ch - 200),
        phase: (i * 0.3) % 1,
        size: 8 + (i % 4) * 4,
      }));

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const elements: ExcalidrawElement[] = [];

        elements.push(
          rectEl('bg', 0, 0, cw, ch, {
            strokeColor: 'transparent',
            backgroundColor: '#0f172a',
            strokeWidth: 0,
            cornerRadius: 0,
            layerId: `frame-${i}`,
          })
        );

        stars.forEach((star, si) => {
          const starT = (t + star.phase) % 1;
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(starT * Math.PI * 2));
          const size = star.size * twinkle;

          elements.push({
            id: `star-${si}`,
            type: 'text',
            x: star.x - size / 2,
            y: star.y - size / 2,
            width: size,
            height: size,
            angle: 0,
            strokeColor: '#fbbf24',
            backgroundColor: 'transparent',
            fillStyle: 'none',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 0,
            seed: 42,
            visible: true,
            locked: false,
            opacity: Math.round(twinkle * 100),
            cornerRadius: 0,
            layerId: `frame-${i}`,
            strokeSharpness: 'round',
            text: '✦',
            fontSize: Math.round(size),
            fontFamily: 'Virgil',
            textAlign: 'center',
          } as ExcalidrawElement);
        });

        frames.push(elements);
      }
      return frames;
    }
  },

  {
    id: 'anim-growing-flower',
    name: '生长的花',
    description: '花朵从种子生长绽放，慢进慢出',
    category: 'fun',
    fps: 24,
    easingConfig: {
      scale: 'easeOutBack',
      position: 'easeOutCubic',
      opacity: 'easeInOutSine',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 35;
      const cx = cw / 2;
      const groundY = ch * 0.7;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;
        const elements: ExcalidrawElement[] = [];

        elements.push(
          rectEl('ground', 0, groundY, cw, ch - groundY, {
            strokeColor: 'transparent',
            backgroundColor: '#1a3a1a',
            strokeWidth: 0,
            cornerRadius: 0,
            layerId: `frame-${i}`,
          })
        );

        const stemProgress = Math.min(1, t * 1.5);
        const easedStemProgress = 1 - Math.pow(1 - stemProgress, 3);
        const stemHeight = 200 * easedStemProgress;
        if (stemHeight > 5) {
          const stemPts: [number, number, number][] = [];
          for (let s = 0; s <= 15; s++) {
            const st = s / 15;
            stemPts.push([
              cx + Math.sin(st * Math.PI) * 5,
              groundY - st * stemHeight,
              0.7
            ]);
          }
          elements.push({
            id: 'stem',
            type: 'free_draw',
            x: cx - 10, y: groundY - stemHeight,
            width: 20, height: stemHeight,
            angle: 0,
            strokeColor: '#16a34a',
            backgroundColor: 'transparent',
            fillStyle: 'none',
            strokeWidth: 3,
            strokeStyle: 'solid',
            roughness: 1,
            seed: 42,
            visible: true,
            locked: false,
            opacity: 100,
            cornerRadius: 0,
            layerId: `frame-${i}`,
            strokeSharpness: 'round',
            points: stemPts,
          } as any);

          if (stemProgress > 0.4) {
            const leafT = Math.min(1, (stemProgress - 0.4) / 0.3);
            const leafSize = 25 * leafT;
            const leafY = groundY - stemHeight * 0.5;
            const leafPts: [number, number, number][] = [];
            for (let a = 0; a <= 15; a++) {
              const angle = (a / 15) * Math.PI * 2;
              leafPts.push([
                cx - 15 + Math.cos(angle) * leafSize,
                leafY + Math.sin(angle) * leafSize * 0.5,
                0.7
              ]);
            }
            elements.push({
              id: 'leaf',
              type: 'free_draw',
              x: cx - 40, y: leafY - leafSize,
              width: leafSize * 2, height: leafSize,
              angle: 0,
              strokeColor: '#16a34a',
              backgroundColor: '#86efac',
              fillStyle: 'solid',
              strokeWidth: 1,
              strokeStyle: 'solid',
              roughness: 2,
              seed: 42,
              visible: true,
              locked: false,
              opacity: Math.round(leafT * 100),
              cornerRadius: 0,
              layerId: `frame-${i}`,
              strokeSharpness: 'round',
              points: leafPts,
            } as any);
          }

          if (stemProgress > 0.6) {
            const bloomT = Math.min(1, (stemProgress - 0.6) / 0.4);
            const flowerY = groundY - stemHeight;
            const petalSize = 20 * bloomT;

            for (let p = 0; p < 6; p++) {
              const angle = (p / 6) * Math.PI * 2;
              const px = cx + Math.cos(angle) * petalSize * 1.5;
              const py = flowerY + Math.sin(angle) * petalSize;

              elements.push(
                ellipseEl(`petal-${p}`, px - petalSize / 2, py - petalSize / 2, petalSize, petalSize, {
                  strokeColor: '#e11d48',
                  backgroundColor: '#fda4af',
                  opacity: Math.round(bloomT * 90),
                  layerId: `frame-${i}`,
                })
              );
            }

            elements.push(
              ellipseEl('center', cx - 8 * bloomT, flowerY - 8 * bloomT, 16 * bloomT, 16 * bloomT, {
                strokeColor: '#ca8a04',
                backgroundColor: '#fde047',
                layerId: `frame-${i}`,
              })
            );
          }
        }

        frames.push(elements);
      }
      return frames;
    }
  },

  {
    id: 'anim-elastic-scale',
    name: '弹性缩放',
    description: '图形弹性放大缩小，橡皮筋效果',
    category: 'fun',
    fps: 30,
    easingConfig: {
      scale: 'easeOutElastic',
      opacity: 'easeInOutSine',
    },
    generateFrames: (cw, ch) => {
      const frames: ExcalidrawElement[][] = [];
      const totalFrames = 30;
      const cx = cw / 2;
      const cy = ch / 2;

      for (let i = 0; i <= totalFrames; i++) {
        const t = i / totalFrames;

        const c4 = (2 * Math.PI) / 3;
        const elastic = t === 0 ? 0 : t === 1 ? 1 :
          Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;

        const scale = 0.2 + elastic * 0.8;
        const size = 100 * scale;

        frames.push([
          rectEl('box', cx - size / 2, cy - size / 2, size, size, {
            strokeColor: '#8b5cf6',
            backgroundColor: '#ede9fe',
            cornerRadius: Math.round(16 * scale),
            layerId: `frame-${i}`,
          }),
          textEl('label', cx - 30, cy + size / 2 + 10, '弹性!', {
            fontSize: 20,
            strokeColor: '#6b7280',
            opacity: Math.round(elastic * 100),
            layerId: `frame-${i}`,
          }),
        ]);
      }
      return frames;
    }
  },
];

export const ANIM_CATEGORY_NAMES: Record<string, string> = {
  text: '文字动画',
  shape: '图形动画',
  scene: '场景动画',
  fun: '趣味动画',
};

export const getAnimTemplatesByCategory = (category: string) =>
  ANIMATION_TEMPLATES.filter(t => t.category === category);

export const getAllAnimCategories = () =>
  [...new Set(ANIMATION_TEMPLATES.map(t => t.category))];
