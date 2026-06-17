import { ExcalidrawElement } from '../types';
import { getEasingValue, EasingType, SpringConfig, GravityConfig, MotionTrailConfig, DEFAULT_TRAIL_CONFIG } from './physicsAnimation';

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const physicsLerp = (
  start: number,
  end: number,
  t: number,
  easing: EasingType = 'easeOutCubic',
  springConfig?: SpringConfig,
  gravityConfig?: GravityConfig
): number => {
  const easedT = getEasingValue(easing, t, springConfig, gravityConfig);
  return start + (end - start) * easedT;
};

const resamplePoints = (points: [number, number, number][], targetCount: number): [number, number, number][] => {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(targetCount).fill(points[0]);

  let totalLength = 0;
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i-1][0];
    const dy = points[i][1] - points[i-1][1];
    const dist = Math.sqrt(dx*dx + dy*dy);
    totalLength += dist;
    lengths.push(totalLength);
  }

  const newPoints: [number, number, number][] = [points[0]];
  const step = totalLength / (targetCount - 1);

  let currentSrcIndex = 0;

  for (let i = 1; i < targetCount - 1; i++) {
    const targetDist = i * step;
    while (currentSrcIndex < lengths.length - 1 && lengths[currentSrcIndex + 1] < targetDist) {
      currentSrcIndex++;
    }

    const segmentStartDist = lengths[currentSrcIndex];
    const segmentEndDist = lengths[currentSrcIndex + 1];
    const segmentLen = segmentEndDist - segmentStartDist;
    const t = segmentLen === 0 ? 0 : (targetDist - segmentStartDist) / segmentLen;

    const p1 = points[currentSrcIndex];
    const p2 = points[currentSrcIndex + 1];

    newPoints.push([
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t,
      p1[2] || 1
    ]);
  }

  newPoints.push(points[points.length - 1]);
  return newPoints;
};

// ---- Animation Easing Config (per-property) ----

export interface AnimationEasingConfig {
  position?: EasingType;
  scale?: EasingType;
  rotation?: EasingType;
  opacity?: EasingType;
  path?: EasingType;
  springConfig?: SpringConfig;
  gravityConfig?: GravityConfig;
  stagger?: StaggerConfig;
  trail?: MotionTrailConfig;
}

// ---- Stagger Config (elements animate with delay) ----

export interface StaggerConfig {
  enabled: boolean;
  delayPerElement: number;
  maxDelay: number;
}

export const DEFAULT_STAGGER: StaggerConfig = {
  enabled: false,
  delayPerElement: 0.05,
  maxDelay: 0.3,
};

// ---- Default Easing Config (follows slow-in-slow-out principles) ----

const DEFAULT_EASING: AnimationEasingConfig = {
  position: 'easeInOutCubic',
  scale: 'easeOutBack',
  rotation: 'easeInOutCubic',
  opacity: 'easeInOutSine',
  path: 'easeInOutCubic',
  stagger: DEFAULT_STAGGER,
  trail: DEFAULT_TRAIL_CONFIG,
};

// ---- Compute staggered t for each element ----

export const computeStaggeredT = (
  t: number,
  elementIndex: number,
  totalElements: number,
  stagger?: StaggerConfig
): number => {
  if (!stagger || !stagger.enabled) return t;
  const delay = Math.min(elementIndex * stagger.delayPerElement, stagger.maxDelay);
  const adjustedT = (t - delay) / (1 - stagger.maxDelay);
  return Math.max(0, Math.min(1, adjustedT));
};

// ---- Interpolate two elements with per-property easing ----

export const interpolateElements = (
  startElement: ExcalidrawElement,
  endElement: ExcalidrawElement,
  t: number,
  easingConfig: AnimationEasingConfig = DEFAULT_EASING
): ExcalidrawElement => {
  const ec = { ...DEFAULT_EASING, ...easingConfig };

  const baseElement = {
    ...startElement,
    x: physicsLerp(startElement.x, endElement.x, t, ec.position, ec.springConfig, ec.gravityConfig),
    y: physicsLerp(startElement.y, endElement.y, t, ec.position, ec.springConfig, ec.gravityConfig),
    width: physicsLerp(startElement.width, endElement.width, t, ec.scale, ec.springConfig),
    height: physicsLerp(startElement.height, endElement.height, t, ec.scale, ec.springConfig),
    angle: physicsLerp(startElement.angle, endElement.angle, t, ec.rotation),
    strokeWidth: physicsLerp(startElement.strokeWidth, endElement.strokeWidth, t, ec.scale, ec.springConfig),
    opacity: physicsLerp(startElement.opacity, endElement.opacity, t, ec.opacity),
  };

  if (startElement.type === 'free_draw' && endElement.type === 'free_draw') {
    const startPoints = (startElement as any).points;
    const endPoints = (endElement as any).points;

    const maxPoints = Math.max(startPoints.length, endPoints.length);

    const resampledStart = resamplePoints(startPoints, maxPoints);
    const resampledEnd = resamplePoints(endPoints, maxPoints);

    const easedT = getEasingValue(ec.path || 'easeInOutCubic', t, ec.springConfig);

    const newPoints = resampledStart.map((p, i) => {
      const pointDelay = (i / maxPoints) * 0.05;
      const pointT = Math.max(0, Math.min(1, (easedT - pointDelay) / (1 - pointDelay)));

      return [
        lerp(p[0], resampledEnd[i][0], pointT),
        lerp(p[1], resampledEnd[i][1], pointT),
        lerp(p[2] || 1, resampledEnd[i][2] || 1, pointT)
      ];
    });

    return {
      ...baseElement,
      points: newPoints
    } as any;
  }

  return baseElement;
};

// ---- Match elements by ID between two frames ----

export const matchElements = (
  startElements: ExcalidrawElement[],
  endElements: ExcalidrawElement[]
): Array<{ start: ExcalidrawElement; end: ExcalidrawElement }> => {
  const matchedElements: Array<{ start: ExcalidrawElement; end: ExcalidrawElement }> = [];

  const endElementMap = new Map<string, ExcalidrawElement>();
  endElements.forEach(element => {
    endElementMap.set(element.id, element);
  });

  startElements.forEach(startElement => {
    const endElement = endElementMap.get(startElement.id);
    if (endElement && startElement.type === endElement.type) {
      matchedElements.push({ start: startElement, end: endElement });
    }
  });

  return matchedElements;
};

// ---- Generate interpolated elements for a specific time t ----

export const generateTweenFrame = (
  startElements: ExcalidrawElement[],
  endElements: ExcalidrawElement[],
  t: number,
  easingConfig?: AnimationEasingConfig
): ExcalidrawElement[] => {
  const ec = { ...DEFAULT_EASING, ...easingConfig };
  const matchedElements = matchElements(startElements, endElements);
  const interpolatedElements: ExcalidrawElement[] = [];

  matchedElements.forEach(({ start, end }, index) => {
    const staggeredT = computeStaggeredT(t, index, matchedElements.length, ec.stagger);
    const interpolated = interpolateElements(start, end, staggeredT, ec);
    interpolatedElements.push(interpolated);
  });

  const startElementIds = new Set(matchedElements.map(({ start }) => start.id));
  startElements.forEach(element => {
    if (!startElementIds.has(element.id)) {
      const elementT = computeStaggeredT(t, interpolatedElements.length, startElements.length, ec.stagger);
      const fadeOpacity = lerp(element.opacity, 0, elementT);
      interpolatedElements.push({ ...element, opacity: Math.round(fadeOpacity) });
    }
  });

  if (t >= 0.5) {
    const endElementIds = new Set(matchedElements.map(({ end }) => end.id));
    endElements.forEach(element => {
      if (!endElementIds.has(element.id)) {
        const elementT = computeStaggeredT(t, interpolatedElements.length, endElements.length, ec.stagger);
        const fadeOpacity = lerp(0, element.opacity, elementT);
        interpolatedElements.push({ ...element, opacity: Math.round(fadeOpacity) });
      }
    });
  }

  return interpolatedElements;
};

// ---- Generate multiple tween frames between two keyframes ----

export const generateTweenFrames = (
  startElements: ExcalidrawElement[],
  endElements: ExcalidrawElement[],
  frameCount: number,
  easingConfig?: AnimationEasingConfig
): ExcalidrawElement[][] => {
  const frames: ExcalidrawElement[][] = [];
  for (let i = 0; i <= frameCount; i++) {
    const t = i / frameCount;
    frames.push(generateTweenFrame(startElements, endElements, t, easingConfig));
  }
  return frames;
};

// ---- Motion Trail Frame Generator ----

export interface TrailFrame {
  elements: ExcalidrawElement[];
  alpha: number;
}

export const generateTrailFrames = (
  prevFrame: ExcalidrawElement[],
  currentFrame: ExcalidrawElement[],
  trailConfig?: MotionTrailConfig
): TrailFrame[] => {
  const config = trailConfig || DEFAULT_TRAIL_CONFIG;
  if (!config.enabled) return [];

  const trails: TrailFrame[] = [];
  const trailAlphas = [];

  for (let i = 0; i < config.trailCount; i++) {
    trailAlphas.push(Math.pow(config.trailDecay, i + 1));
  }

  for (let i = 0; i < trailAlphas.length; i++) {
    const blendT = (i + 1) / (trailAlphas.length + 1);
    const blendedElements = generateTweenFrame(prevFrame, currentFrame, blendT, {
      ...DEFAULT_EASING,
      position: 'linear',
      opacity: 'linear',
      scale: 'linear',
      rotation: 'linear',
      path: 'linear',
    });

    trails.push({
      elements: blendedElements,
      alpha: trailAlphas[i],
    });
  }

  return trails;
};

// ---- Compute element displacement (for trail speed detection) ----

export const computeElementDisplacement = (
  prevElements: ExcalidrawElement[],
  currentElements: ExcalidrawElement[]
): Map<string, number> => {
  const displacementMap = new Map<string, number>();
  const prevMap = new Map<string, ExcalidrawElement>();
  prevElements.forEach(el => prevMap.set(el.id, el));

  currentElements.forEach(curr => {
    const prev = prevMap.get(curr.id);
    if (prev) {
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      displacementMap.set(curr.id, Math.sqrt(dx * dx + dy * dy));
    }
  });

  return displacementMap;
};
