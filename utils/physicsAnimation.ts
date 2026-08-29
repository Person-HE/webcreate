// ============================================================
// Physics Animation Engine v2
// Real physics formulas for silky-smooth, realistic animations
// Core principles:
//   1. Slow-in slow-out (ease-in-ease-out) for natural inertia
//   2. Motion curves convey weight and material
//   3. Smooth transitions via variable-speed interpolation
//   4. Motion trails for high-speed movement
// ============================================================

import { ExcalidrawElement } from '../types';

// ---- Easing Functions (t: 0→1, returns 0→1) ----

export const linear = (t: number): number => t;

export const easeInQuad = (t: number): number => t * t;

export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);

export const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeInCubic = (t: number): number => t * t * t;

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export const easeInOutQuart = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

export const easeInQuint = (t: number): number => t * t * t * t * t;

export const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

export const easeInOutQuint = (t: number): number =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

// Sine-based easing — smoothest slow-in-slow-out, ideal for UI transitions
export const easeInSine = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);

export const easeOutSine = (t: number): number => Math.sin((t * Math.PI) / 2);

export const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

// Exponential easing — sharp deceleration, heavy objects settling
export const easeInExpo = (t: number): number =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10);

export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInOutExpo = (t: number): number =>
  t === 0 ? 0 : t === 1 ? 1 :
  t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;

// Circular easing — smooth organic feel
export const easeInCirc = (t: number): number => 1 - Math.sqrt(1 - t * t);

export const easeOutCirc = (t: number): number => Math.sqrt(1 - (t - 1) * (t - 1));

export const easeInOutCirc = (t: number): number =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

// Back easing — slight overshoot then settle
export const easeInBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeInOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

// Elastic easing — rubber band stretch
export const easeOutElastic = (t: number): number => {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const easeInElastic = (t: number): number => {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

export const easeInOutElastic = (t: number): number => {
  if (t === 0 || t === 1) return t;
  const c5 = (2 * Math.PI) / 4.5;
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

// Bounce easing — ball hitting ground
export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

export const easeInBounce = (t: number): number => 1 - easeOutBounce(1 - t);

export const easeInOutBounce = (t: number): number =>
  t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;


// ---- Cubic Bezier (custom easing curves) ----

export const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number, t: number): number => {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (tt: number) => ((ax * tt + bx) * tt + cx) * tt;
  const sampleY = (tt: number) => ((ay * tt + by) * tt + cy) * tt;
  const sampleXDeriv = (tt: number) => (3 * ax * tt + 2 * bx) * tt + cx;

  let guessT = t;
  for (let i = 0; i < 8; i++) {
    const currentX = sampleX(guessT) - t;
    if (Math.abs(currentX) < 1e-7) break;
    const currentSlope = sampleXDeriv(guessT);
    if (Math.abs(currentSlope) < 1e-7) break;
    guessT -= currentX / currentSlope;
  }

  return sampleY(Math.max(0, Math.min(1, guessT)));
};


// ---- Spring Physics (damped harmonic oscillator) ----

export interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
  initialVelocity?: number;
}

export interface SpringResult {
  value: number;
  velocity: number;
  isSettled: boolean;
}

export const spring = (t: number, config: SpringConfig): SpringResult => {
  const { mass = 1, stiffness = 170, damping = 26, initialVelocity = 0 } = config;

  const omega_n = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  let value: number;
  let velocity: number;

  if (zeta < 1) {
    const omega_d = omega_n * Math.sqrt(1 - zeta * zeta);
    const A = 1;
    const B = (zeta * omega_n * A + initialVelocity) / omega_d;

    const decay = Math.exp(-zeta * omega_n * t);
    value = decay * (A * Math.cos(omega_d * t) + B * Math.sin(omega_d * t));
    velocity = -zeta * omega_n * value +
      decay * (-A * omega_d * Math.sin(omega_d * t) + B * omega_d * Math.cos(omega_d * t));
  } else if (zeta === 1) {
    const A = 1;
    const B = initialVelocity + omega_n * A;
    const decay = Math.exp(-omega_n * t);
    value = (A + B * t) * decay;
    velocity = (B - omega_n * (A + B * t)) * decay;
  } else {
    const s1 = -omega_n * (zeta - Math.sqrt(zeta * zeta - 1));
    const s2 = -omega_n * (zeta + Math.sqrt(zeta * zeta - 1));
    const A = (initialVelocity - s2) / (s1 - s2);
    const B = 1 - A;
    value = A * Math.exp(s1 * t) + B * Math.exp(s2 * t);
    velocity = A * s1 * Math.exp(s1 * t) + B * s2 * Math.exp(s2 * t);
  }

  return {
    value: Math.max(0, Math.min(1, value)),
    velocity,
    isSettled: Math.abs(value) < 0.001 && Math.abs(velocity) < 0.001,
  };
};


// ---- Gravity Simulation ----

export interface GravityConfig {
  gravity: number;
  bounceRestitution: number;
  initialHeight: number;
  groundLevel: number;
}

export const gravity = (t: number, config: GravityConfig): number => {
  const { gravity: g = 9.8, bounceRestitution = 0.6, initialHeight = 1, groundLevel = 0 } = config;

  const scale = 3;
  const gt = t * scale;

  // Returns normalized easing progress 0→1 (0 = at start height, 1 = settled at ground).
  // Physical height h is converted: progress = 1 - clamp(h - groundLevel).
  const heightToProgress = (h: number): number =>
    1 - Math.max(0, Math.min(1, h - groundLevel));

  const fallTime = Math.sqrt(2 * initialHeight / g);
  if (gt <= fallTime) {
    return heightToProgress(initialHeight - 0.5 * g * gt * gt);
  }

  let currentTime = fallTime;
  let bounceHeight = initialHeight;
  let bounceV = Math.sqrt(2 * g * bounceHeight) * bounceRestitution;

  for (let i = 0; i < 10; i++) {
    const bounceTime = 2 * bounceV / g;
    if (gt <= currentTime + bounceTime) {
      const localT = gt - currentTime;
      const halfBounce = bounceV / g;
      if (localT <= halfBounce) {
        return heightToProgress(groundLevel + bounceV * localT - 0.5 * g * localT * localT);
      } else {
        const fallT = localT - halfBounce;
        const peakH = bounceV * halfBounce - 0.5 * g * halfBounce * halfBounce;
        return heightToProgress(groundLevel + peakH - 0.5 * g * fallT * fallT);
      }
    }
    currentTime += bounceTime;
    bounceV *= bounceRestitution;
    if (bounceV < 0.1) break;
  }

  return 1;
};


// ---- Inertia (exponential velocity decay) ----

export interface InertiaConfig {
  initialVelocity: number;
  friction: number;
  threshold: number;
}

export const inertia = (t: number, config: InertiaConfig): number => {
  const { initialVelocity, friction = 0.95, threshold = 0.01 } = config;

  const frictionPow = Math.pow(friction, t * 60);
  const position = initialVelocity * (1 - frictionPow) / (1 - friction);

  return position;
};


// ---- Preset Spring Configs ----

export const SPRING_PRESETS = {
  gentle: { mass: 1, stiffness: 120, damping: 14 },
  bouncy: { mass: 1, stiffness: 180, damping: 10 },
  stiff: { mass: 1, stiffness: 300, damping: 30 },
  slow: { mass: 2, stiffness: 80, damping: 20 },
  elastic: { mass: 0.8, stiffness: 200, damping: 8 },
  heavy: { mass: 3, stiffness: 200, damping: 25 },
} as const;


// ---- Motion Trail / Afterimage System ----

export interface MotionTrailConfig {
  enabled: boolean;
  trailCount: number;
  trailDecay: number;
  speedThreshold: number;
}

export const DEFAULT_TRAIL_CONFIG: MotionTrailConfig = {
  enabled: true,
  trailCount: 4,
  trailDecay: 0.6,
  speedThreshold: 50,
};

export const computeElementSpeed = (
  prevElement: ExcalidrawElement | null,
  currentElement: ExcalidrawElement,
  dt: number
): number => {
  if (!prevElement || dt === 0) return 0;
  const dx = currentElement.x - prevElement.x;
  const dy = currentElement.y - prevElement.y;
  return Math.sqrt(dx * dx + dy * dy) / dt;
};

export const shouldShowTrail = (
  speed: number,
  config: MotionTrailConfig
): boolean => {
  return config.enabled && speed > config.speedThreshold;
};

export const computeTrailAlphas = (config: MotionTrailConfig): number[] => {
  const alphas: number[] = [];
  for (let i = 0; i < config.trailCount; i++) {
    alphas.push(Math.pow(config.trailDecay, i + 1));
  }
  return alphas;
};


// ---- Camera Shake ----

export interface CameraShakeConfig {
  enabled: boolean;
  intensity: number;
  decay: number;
  duration: number;
}

export const computeCameraShake = (
  elapsed: number,
  config: CameraShakeConfig
): { offsetX: number; offsetY: number } => {
  if (!config.enabled || elapsed > config.duration) return { offsetX: 0, offsetY: 0 };
  const progress = elapsed / config.duration;
  const currentIntensity = config.intensity * Math.exp(-config.decay * progress);
  const angle = Math.random() * Math.PI * 2;
  return {
    offsetX: Math.cos(angle) * currentIntensity,
    offsetY: Math.sin(angle) * currentIntensity,
  };
};


// ---- Easing Type Enum ----

export type EasingType =
  | 'linear'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeOutElastic' | 'easeInElastic' | 'easeInOutElastic'
  | 'easeOutBounce' | 'easeInBounce' | 'easeInOutBounce'
  | 'spring'
  | 'gravity';

const easingMap: Record<string, (t: number) => number> = {
  linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeOutQuart, easeInOutQuart,
  easeInQuint, easeOutQuint, easeInOutQuint,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInBack, easeOutBack, easeInOutBack,
  easeOutElastic, easeInElastic, easeInOutElastic,
  easeOutBounce, easeInBounce, easeInOutBounce,
};

export const getEasingValue = (
  easing: EasingType,
  t: number,
  springConfig?: SpringConfig,
  gravityConfig?: GravityConfig
): number => {
  const clampedT = Math.max(0, Math.min(1, t));

  if (easing === 'spring' && springConfig) {
    return spring(clampedT, springConfig).value;
  }

  if (easing === 'gravity' && gravityConfig) {
    return gravity(clampedT, gravityConfig);
  }

  const fn = easingMap[easing];
  return fn ? fn(clampedT) : clampedT;
};

// ---- Easing Description Map (for documentation/AI generation) ----

export const EASING_DESCRIPTIONS: Record<EasingType, { label: string; description: string; useCase: string }> = {
  'linear': { label: '匀速', description: '匀速运动，无加减速', useCase: '旋转、匀速平移' },
  'easeInQuad': { label: '慢进(二次)', description: '缓慢启动，逐渐加速', useCase: '物体开始移动' },
  'easeOutQuad': { label: '慢出(二次)', description: '快速启动，缓慢停止', useCase: '轻物体减速' },
  'easeInOutQuad': { label: '慢进慢出(二次)', description: '慢启动→加速→慢停止', useCase: 'UI元素移动' },
  'easeInCubic': { label: '慢进(三次)', description: '更缓慢启动，加速更明显', useCase: '重物启动' },
  'easeOutCubic': { label: '慢出(三次)', description: '快启动，柔和减速停止', useCase: '通用减速，默认推荐' },
  'easeInOutCubic': { label: '慢进慢出(三次)', description: '平滑的慢-快-慢', useCase: '通用位移，最常用' },
  'easeOutQuart': { label: '慢出(四次)', description: '快速启动，非常柔和停止', useCase: '弹窗出现' },
  'easeInOutQuart': { label: '慢进慢出(四次)', description: '更明显的慢-快-慢', useCase: '页面切换' },
  'easeInQuint': { label: '慢进(五次)', description: '极度缓慢启动', useCase: '蓄力动作' },
  'easeOutQuint': { label: '慢出(五次)', description: '极度柔和停止', useCase: '精致减速' },
  'easeInOutQuint': { label: '慢进慢出(五次)', description: '最明显的慢-快-慢', useCase: '重要元素移动' },
  'easeInSine': { label: '慢进(正弦)', description: '最柔和的缓慢启动', useCase: '淡入效果' },
  'easeOutSine': { label: '慢出(正弦)', description: '最柔和的缓慢停止', useCase: '淡出效果' },
  'easeInOutSine': { label: '慢进慢出(正弦)', description: '最平滑的慢-快-慢', useCase: '丝滑转场首选' },
  'easeInExpo': { label: '慢进(指数)', description: '几乎不动然后突然加速', useCase: '爆炸前蓄力' },
  'easeOutExpo': { label: '慢出(指数)', description: '急速后突然减速停止', useCase: '重物落地' },
  'easeInOutExpo': { label: '慢进慢出(指数)', description: '极慢→极快→极慢', useCase: '戏剧性运动' },
  'easeInCirc': { label: '慢进(圆弧)', description: '圆弧形缓慢启动', useCase: '有机运动启动' },
  'easeOutCirc': { label: '慢出(圆弧)', description: '圆弧形柔和停止', useCase: '有机运动停止' },
  'easeInOutCirc': { label: '慢进慢出(圆弧)', description: '圆弧形慢-快-慢', useCase: '自然运动' },
  'easeInBack': { label: '回弹进', description: '先回退再前进', useCase: '弹性出现' },
  'easeOutBack': { label: '回弹出', description: '超过目标后回弹', useCase: '弹性缩放、弹入' },
  'easeInOutBack': { label: '回弹进回弹出', description: '回退→前进→超过→回弹', useCase: '弹性移动' },
  'easeOutElastic': { label: '橡皮筋出', description: '像橡皮筋一样振荡停止', useCase: '弹簧效果、轻物回弹' },
  'easeInElastic': { label: '橡皮筋进', description: '振荡式启动', useCase: '特殊效果' },
  'easeInOutElastic': { label: '橡皮筋进出', description: '振荡式启动和停止', useCase: '趣味动画' },
  'easeOutBounce': { label: '弹跳出', description: '像球落地一样弹跳', useCase: '弹跳落地' },
  'easeInBounce': { label: '弹跳进', description: '反向弹跳启动', useCase: '特殊效果' },
  'easeInOutBounce': { label: '弹跳进出', description: '弹跳式启动和停止', useCase: '趣味弹跳' },
  'spring': { label: '弹簧物理', description: '真实弹簧物理模拟', useCase: '物理回弹、弹性交互' },
  'gravity': { label: '重力物理', description: '真实重力弹跳模拟', useCase: '掉落弹跳' },
};

// ---- Recommended Easing Presets for Animation Types ----

export const ANIMATION_EASING_PRESETS = {
  slideIn: {
    position: 'easeOutCubic' as EasingType,
    opacity: 'easeOutSine' as EasingType,
  },
  slideOut: {
    position: 'easeInCubic' as EasingType,
    opacity: 'easeInSine' as EasingType,
  },
  fadeIn: {
    opacity: 'easeInOutSine' as EasingType,
  },
  scaleIn: {
    scale: 'easeOutBack' as EasingType,
    opacity: 'easeOutSine' as EasingType,
  },
  bounceIn: {
    position: 'gravity' as EasingType,
    scale: 'easeOutBack' as EasingType,
  },
  springIn: {
    position: 'spring' as EasingType,
    scale: 'spring' as EasingType,
  },
  gentleMove: {
    position: 'easeInOutSine' as EasingType,
    rotation: 'easeInOutCubic' as EasingType,
    opacity: 'easeInOutSine' as EasingType,
  },
  heavyDrop: {
    position: 'easeInExpo' as EasingType,
    scale: 'easeOutBounce' as EasingType,
  },
  lightFloat: {
    position: 'easeOutElastic' as EasingType,
    scale: 'easeOutElastic' as EasingType,
  },
  smoothTransition: {
    position: 'easeInOutCubic' as EasingType,
    scale: 'easeInOutSine' as EasingType,
    rotation: 'easeInOutCubic' as EasingType,
    opacity: 'easeInOutSine' as EasingType,
    path: 'easeInOutCubic' as EasingType,
  },
};
