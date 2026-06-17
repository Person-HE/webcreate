// AI Drawing Service
// Abstract interface + Mock implementation
// Generates human-like freehand strokes with natural wobble and pressure

import { v4 as uuidv4 } from 'uuid';

export interface AIGenerateResult {
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
  description: string;
}

const rand = () => Math.floor(Math.random() * 100000);

// ============================================================
// HUMAN-LIKE FREEHAND STROKE GENERATION
// ============================================================

// Gaussian random (Box-Muller) for natural variation
const gaussianRandom = (mean: number = 0, stdev: number = 1): number => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
};

// Generate natural hand wobble offset
// Human hands have tremor at ~8-12Hz, we simulate this
const wobble = (magnitude: number = 1.5): [number, number] => {
  return [
    gaussianRandom(0, magnitude),
    gaussianRandom(0, magnitude)
  ];
};

// Pressure curve: humans press lighter at start and end, heavier in middle
const pressureCurve = (t: number, startP: number = 0.6, midP: number = 1.0, endP: number = 0.5): number => {
  // Smooth bell curve
  if (t < 0.15) {
    // Ramp up
    return startP + (midP - startP) * (t / 0.15);
  } else if (t > 0.85) {
    // Ramp down
    return midP + (endP - midP) * ((t - 0.85) / 0.15);
  }
  // Middle with slight variation
  return midP + gaussianRandom(0, 0.05);
};

// Core function: generate a human-like freehand stroke along a path
// pathPoints: array of [x, y] waypoints the stroke should roughly follow
// spacing: pixels between points (3-5 for smooth lines)
// wobbleAmt: how much the hand trembles (1-3 for subtle, 3-6 for visible)
const humanStroke = (
  pathPoints: [number, number][],
  spacing: number = 4,
  wobbleAmt: number = 2,
  pressureStart: number = 0.6,
  pressureMid: number = 1.0,
  pressureEnd: number = 0.5,
  closed: boolean = false
): [number, number, number][] => {
  if (pathPoints.length < 2) return pathPoints.map(p => [p[0], p[1], 0.8]);

  const result: [number, number, number][] = [];

  // Interpolate between waypoints with spacing
  for (let seg = 0; seg < pathPoints.length - (closed ? 0 : 1); seg++) {
    const p1 = pathPoints[seg];
    const p2 = pathPoints[(seg + 1) % pathPoints.length];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (segLen < 0.1) continue;

    const numSteps = Math.max(1, Math.floor(segLen / spacing));

    for (let i = 0; i < numSteps; i++) {
      const t = i / numSteps;
      const x = p1[0] + dx * t;
      const y = p1[1] + dy * t;

      // Add hand wobble (less at endpoints of each segment)
      const edgeFade = Math.min(t * 4, (1 - t) * 4, 1);
      const [wx, wy] = wobble(wobbleAmt * edgeFade);

      // Global progress for pressure
      const globalT = (seg + t) / (pathPoints.length - (closed ? 0 : 1));
      const pressure = Math.max(0.3, Math.min(1, pressureCurve(globalT, pressureStart, pressureMid, pressureEnd)));

      result.push([x + wx, y + wy, pressure]);
    }
  }

  // Add final point
  if (!closed) {
    const last = pathPoints[pathPoints.length - 1];
    result.push([last[0] + gaussianRandom(0, wobbleAmt * 0.3), last[1] + gaussianRandom(0, wobbleAmt * 0.3), pressureEnd]);
  }

  return result;
};

// Generate a circle as freehand stroke (not mathematically perfect)
const humanCircle = (cx: number, cy: number, r: number, wobbleAmt: number = 2): [number, number, number][] => {
  const waypoints: [number, number][] = [];
  const numWaypoints = Math.max(24, Math.floor(r * 0.8));
  for (let i = 0; i < numWaypoints; i++) {
    const angle = (i / numWaypoints) * Math.PI * 2;
    // Add slight radius wobble (human circles aren't perfect)
    const rWobble = r + gaussianRandom(0, r * 0.02);
    waypoints.push([cx + Math.cos(angle) * rWobble, cy + Math.sin(angle) * rWobble]);
  }
  return humanStroke(waypoints, 4, wobbleAmt, 0.7, 1.0, 0.7, true);
};

// Generate an ellipse as freehand stroke
const humanEllipse = (cx: number, cy: number, rx: number, ry: number, wobbleAmt: number = 2): [number, number, number][] => {
  const waypoints: [number, number][] = [];
  const numWaypoints = Math.max(24, Math.floor((rx + ry) * 0.4));
  for (let i = 0; i < numWaypoints; i++) {
    const angle = (i / numWaypoints) * Math.PI * 2;
    const rxW = rx + gaussianRandom(0, rx * 0.02);
    const ryW = ry + gaussianRandom(0, ry * 0.02);
    waypoints.push([cx + Math.cos(angle) * rxW, cy + Math.sin(angle) * ryW]);
  }
  return humanStroke(waypoints, 4, wobbleAmt, 0.7, 1.0, 0.7, true);
};

// Generate a curved line (like a smile, eyebrow, etc.)
const humanCurve = (
  points: [number, number][],
  wobbleAmt: number = 2,
  pressureStart: number = 0.6,
  pressureEnd: number = 0.5
): [number, number, number][] => {
  return humanStroke(points, 4, wobbleAmt, pressureStart, 1.0, pressureEnd, false);
};

// Generate a filled shape from waypoints (face outline, etc.)
const humanFilledShape = (
  waypoints: [number, number][],
  wobbleAmt: number = 2
): [number, number, number][] => {
  return humanStroke(waypoints, 4, wobbleAmt, 0.7, 1.0, 0.7, true);
};

// Catmull-Rom spline interpolation for smooth curves through control points
const catmullRomSpline = (
  controlPoints: [number, number][],
  numPointsPerSegment: number = 10
): [number, number][] => {
  if (controlPoints.length < 2) return controlPoints;

  const result: [number, number][] = [];

  // Add virtual start and end points for smooth start/end
  const pts: [number, number][] = [
    [controlPoints[0][0] - (controlPoints[1][0] - controlPoints[0][0]), controlPoints[0][1] - (controlPoints[1][1] - controlPoints[0][1])],
    ...controlPoints,
    [controlPoints[controlPoints.length - 1][0] + (controlPoints[controlPoints.length - 1][0] - controlPoints[controlPoints.length - 2][0]),
     controlPoints[controlPoints.length - 1][1] + (controlPoints[controlPoints.length - 1][1] - controlPoints[controlPoints.length - 2][1])]
  ];

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    for (let j = 0; j < numPointsPerSegment; j++) {
      const t = j / numPointsPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      const x = 0.5 * (
        (2 * p1[0]) +
        (-p0[0] + p2[0]) * t +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
      );
      const y = 0.5 * (
        (2 * p1[1]) +
        (-p0[1] + p2[1]) * t +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
      );

      result.push([x, y]);
    }
  }

  // Add last point
  result.push(controlPoints[controlPoints.length - 1]);

  return result;
};

// Generate a smooth curve through control points with human wobble
const smoothHumanCurve = (
  controlPoints: [number, number][],
  wobbleAmt: number = 1.5,
  pressureStart: number = 0.5,
  pressureEnd: number = 0.4
): [number, number, number][] => {
  const smoothPath = catmullRomSpline(controlPoints, 8);
  return humanStroke(smoothPath, 4, wobbleAmt, pressureStart, 1.0, pressureEnd, false);
};


// ============================================================
// FACE GENERATION (human-like freehand)
// ============================================================

const generateFace = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];

  // Face outline (oval, slightly irregular)
  const faceOutline = humanEllipse(cx, cy, size * 0.42, size * 0.52, 2.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.45, y: cy - size * 0.55,
    width: size * 0.9, height: size * 1.1,
    strokeColor: '#1f2937', backgroundColor: '#FDE68A', fillStyle: 'solid',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: faceOutline
  });

  // Left eye (almond shape)
  const leftEyeCx = cx - size * 0.15;
  const leftEyeCy = cy - size * 0.1;
  const eyeSize = size * 0.08;
  const leftEyeOutline = smoothHumanCurve([
    [leftEyeCx - eyeSize, leftEyeCy],
    [leftEyeCx - eyeSize * 0.5, leftEyeCy - eyeSize * 0.6],
    [leftEyeCx, leftEyeCy - eyeSize * 0.7],
    [leftEyeCx + eyeSize * 0.5, leftEyeCy - eyeSize * 0.6],
    [leftEyeCx + eyeSize, leftEyeCy],
    [leftEyeCx + eyeSize * 0.5, leftEyeCy + eyeSize * 0.4],
    [leftEyeCx, leftEyeCy + eyeSize * 0.5],
    [leftEyeCx - eyeSize * 0.5, leftEyeCy + eyeSize * 0.4],
    [leftEyeCx - eyeSize, leftEyeCy]
  ], 1.5, 0.7, 0.7);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: leftEyeCx - eyeSize - 5, y: leftEyeCy - eyeSize - 5,
    width: eyeSize * 2 + 10, height: eyeSize * 2 + 10,
    strokeColor: '#1f2937', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: leftEyeOutline
  });

  // Left pupil
  const leftPupil = humanCircle(leftEyeCx, leftEyeCy, size * 0.025, 1);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: leftEyeCx - size * 0.03, y: leftEyeCy - size * 0.03,
    width: size * 0.06, height: size * 0.06,
    strokeColor: '#1f2937', backgroundColor: '#1f2937', fillStyle: 'solid',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: leftPupil
  });

  // Right eye
  const rightEyeCx = cx + size * 0.15;
  const rightEyeCy = cy - size * 0.1;
  const rightEyeOutline = smoothHumanCurve([
    [rightEyeCx - eyeSize, rightEyeCy],
    [rightEyeCx - eyeSize * 0.5, rightEyeCy - eyeSize * 0.6],
    [rightEyeCx, rightEyeCy - eyeSize * 0.7],
    [rightEyeCx + eyeSize * 0.5, rightEyeCy - eyeSize * 0.6],
    [rightEyeCx + eyeSize, rightEyeCy],
    [rightEyeCx + eyeSize * 0.5, rightEyeCy + eyeSize * 0.4],
    [rightEyeCx, rightEyeCy + eyeSize * 0.5],
    [rightEyeCx - eyeSize * 0.5, rightEyeCy + eyeSize * 0.4],
    [rightEyeCx - eyeSize, rightEyeCy]
  ], 1.5, 0.7, 0.7);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: rightEyeCx - eyeSize - 5, y: rightEyeCy - eyeSize - 5,
    width: eyeSize * 2 + 10, height: eyeSize * 2 + 10,
    strokeColor: '#1f2937', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: rightEyeOutline
  });

  // Right pupil
  const rightPupil = humanCircle(rightEyeCx, rightEyeCy, size * 0.025, 1);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: rightEyeCx - size * 0.03, y: rightEyeCy - size * 0.03,
    width: size * 0.06, height: size * 0.06,
    strokeColor: '#1f2937', backgroundColor: '#1f2937', fillStyle: 'solid',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: rightPupil
  });

  // Eyebrows (curved lines above eyes)
  const leftBrow = smoothHumanCurve([
    [leftEyeCx - eyeSize * 1.2, leftEyeCy - eyeSize * 1.5],
    [leftEyeCx - eyeSize * 0.3, leftEyeCy - eyeSize * 2],
    [leftEyeCx + eyeSize * 0.8, leftEyeCy - eyeSize * 1.7]
  ], 1.5, 0.5, 0.4);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: leftEyeCx - eyeSize * 1.5, y: leftEyeCy - eyeSize * 2.5,
    width: eyeSize * 2.5, height: eyeSize * 1.5,
    strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: leftBrow
  });

  const rightBrow = smoothHumanCurve([
    [rightEyeCx - eyeSize * 0.8, rightEyeCy - eyeSize * 1.7],
    [rightEyeCx + eyeSize * 0.3, rightEyeCy - eyeSize * 2],
    [rightEyeCx + eyeSize * 1.2, rightEyeCy - eyeSize * 1.5]
  ], 1.5, 0.4, 0.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: rightEyeCx - eyeSize, y: rightEyeCy - eyeSize * 2.5,
    width: eyeSize * 2.5, height: eyeSize * 1.5,
    strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: rightBrow
  });

  // Nose (simple curved line)
  const nose = smoothHumanCurve([
    [cx - size * 0.02, cy - size * 0.02],
    [cx - size * 0.06, cy + size * 0.08],
    [cx, cy + size * 0.12],
    [cx + size * 0.06, cy + size * 0.08],
    [cx + size * 0.02, cy - size * 0.02]
  ], 1.5, 0.4, 0.4);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.08, y: cy - size * 0.04,
    width: size * 0.16, height: size * 0.18,
    strokeColor: '#6b7280', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 80, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: nose
  });

  // Mouth (smile curve)
  const mouth = smoothHumanCurve([
    [cx - size * 0.15, cy + size * 0.2],
    [cx - size * 0.08, cy + size * 0.27],
    [cx, cy + size * 0.28],
    [cx + size * 0.08, cy + size * 0.27],
    [cx + size * 0.15, cy + size * 0.2]
  ], 1.5, 0.5, 0.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.18, y: cy + size * 0.15,
    width: size * 0.36, height: size * 0.18,
    strokeColor: '#dc2626', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: mouth
  });

  // Hair (messy strands on top)
  const hairBaseY = cy - size * 0.52;
  for (let strand = 0; strand < 8; strand++) {
    const startX = cx - size * 0.3 + strand * size * 0.08;
    const hair = smoothHumanCurve([
      [startX, hairBaseY + gaussianRandom(0, 5)],
      [startX + gaussianRandom(0, 10), hairBaseY - size * 0.15 + gaussianRandom(0, 10)],
      [startX + gaussianRandom(0, 15), hairBaseY - size * 0.25 + gaussianRandom(0, 10)],
      [startX + gaussianRandom(5, 10), hairBaseY - size * 0.1 + gaussianRandom(0, 8)]
    ], 2.5, 0.6, 0.3);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: startX - 10, y: hairBaseY - size * 0.3,
      width: size * 0.15, height: size * 0.35,
      strokeColor: '#1f2937', backgroundColor: 'transparent', fillStyle: 'none',
      strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 90, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: hair
    });
  }

  return elements;
};


// ============================================================
// TREE GENERATION (human-like freehand)
// ============================================================

const generateTree = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];

  // Trunk (irregular rectangle via freehand)
  const trunkW = size * 0.12;
  const trunkH = size * 0.5;
  const trunkTop = cy - trunkH;
  const trunk = humanFilledShape([
    [cx - trunkW * 0.5 + gaussianRandom(0, 2), cy],
    [cx - trunkW * 0.6 + gaussianRandom(0, 2), cy - trunkH * 0.3],
    [cx - trunkW * 0.4 + gaussianRandom(0, 2), trunkTop],
    [cx + trunkW * 0.4 + gaussianRandom(0, 2), trunkTop],
    [cx + trunkW * 0.6 + gaussianRandom(0, 2), cy - trunkH * 0.3],
    [cx + trunkW * 0.5 + gaussianRandom(0, 2), cy]
  ], 2);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - trunkW, y: trunkTop,
    width: trunkW * 2, height: trunkH,
    strokeColor: '#78350F', backgroundColor: '#D97706', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: trunk
  });

  // Crown (multiple overlapping irregular blobs)
  const crownCenterY = trunkTop - size * 0.15;
  const blobs = [
    { ox: -size * 0.2, oy: 0, r: size * 0.22 },
    { ox: size * 0.2, oy: 0, r: size * 0.22 },
    { ox: 0, oy: -size * 0.15, r: size * 0.25 },
    { ox: -size * 0.1, oy: size * 0.1, r: size * 0.18 },
    { ox: size * 0.1, oy: size * 0.1, r: size * 0.18 },
  ];

  blobs.forEach((blob, i) => {
    const bx = cx + blob.ox;
    const by = crownCenterY + blob.oy;
    const crown = humanEllipse(bx, by, blob.r, blob.r * 0.85, 3);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: bx - blob.r - 5, y: by - blob.r - 5,
      width: blob.r * 2 + 10, height: blob.r * 2 + 10,
      strokeColor: '#15803D', backgroundColor: i % 2 === 0 ? '#86EFAC' : '#4ADE80', fillStyle: 'solid',
      strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 85, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: crown
    });
  });

  return elements;
};


// ============================================================
// HOUSE GENERATION (human-like freehand)
// ============================================================

const generateHouse = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];
  const w = size * 0.8;
  const h = size * 0.6;
  const roofH = size * 0.4;

  // Walls (hand-drawn rectangle)
  const walls = humanFilledShape([
    [cx - w / 2, cy],
    [cx - w / 2, cy - h],
    [cx + w / 2, cy - h],
    [cx + w / 2, cy]
  ], 2.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - w / 2 - 5, y: cy - h - 5,
    width: w + 10, height: h + 10,
    strokeColor: '#1f2937', backgroundColor: '#FEF3C7', fillStyle: 'solid',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: walls
  });

  // Roof (triangle)
  const roof = humanFilledShape([
    [cx - w / 2 - size * 0.1, cy - h],
    [cx, cy - h - roofH],
    [cx + w / 2 + size * 0.1, cy - h]
  ], 2.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - w / 2 - size * 0.15, y: cy - h - roofH - 5,
    width: w + size * 0.3, height: roofH + 10,
    strokeColor: '#991B1B', backgroundColor: '#FCA5A5', fillStyle: 'solid',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: roof
  });

  // Door
  const doorW = w * 0.2;
  const doorH = h * 0.5;
  const door = humanFilledShape([
    [cx - doorW / 2, cy],
    [cx - doorW / 2, cy - doorH],
    [cx + doorW / 2, cy - doorH],
    [cx + doorW / 2, cy]
  ], 1.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - doorW / 2 - 3, y: cy - doorH - 3,
    width: doorW + 6, height: doorH + 3,
    strokeColor: '#92400E', backgroundColor: '#D97706', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: door
  });

  // Window (hand-drawn square)
  const winSize = w * 0.15;
  const winX = cx - w * 0.25;
  const winY = cy - h * 0.65;
  const window1 = humanFilledShape([
    [winX, winY], [winX + winSize, winY],
    [winX + winSize, winY + winSize], [winX, winY + winSize]
  ], 1.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: winX - 3, y: winY - 3,
    width: winSize + 6, height: winSize + 6,
    strokeColor: '#1e40af', backgroundColor: '#93C5FD', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: window1
  });

  // Window cross
  const winCrossH = smoothHumanCurve([
    [winX, winY + winSize / 2], [winX + winSize, winY + winSize / 2]
  ], 1);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: winX, y: winY + winSize / 2 - 3,
    width: winSize, height: 6,
    strokeColor: '#1e40af', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 80, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: winCrossH
  });
  const winCrossV = smoothHumanCurve([
    [winX + winSize / 2, winY], [winX + winSize / 2, winY + winSize]
  ], 1);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: winX + winSize / 2 - 3, y: winY,
    width: 6, height: winSize,
    strokeColor: '#1e40af', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 80, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: winCrossV
  });

  // Smoke (wavy lines)
  const smokeBaseX = cx + w * 0.3;
  const smokeBaseY = cy - h - roofH + size * 0.05;
  for (let s = 0; s < 3; s++) {
    const smoke = smoothHumanCurve([
      [smokeBaseX, smokeBaseY - s * 20],
      [smokeBaseX + 8 + gaussianRandom(0, 5), smokeBaseY - 15 - s * 20],
      [smokeBaseX - 5 + gaussianRandom(0, 5), smokeBaseY - 30 - s * 20],
      [smokeBaseX + 10 + gaussianRandom(0, 5), smokeBaseY - 45 - s * 20],
    ], 2, 0.5, 0.3);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: smokeBaseX - 20, y: smokeBaseY - 50 - s * 20,
      width: 50, height: 55,
      strokeColor: '#9CA3AF', backgroundColor: 'transparent', fillStyle: 'none',
      strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 50 - s * 10, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: smoke
    });
  }

  return elements;
};


// ============================================================
// SUN GENERATION (human-like freehand)
// ============================================================

const generateSun = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];

  // Sun body (irregular circle)
  const sunBody = humanCircle(cx, cy, size * 0.3, 2.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.35, y: cy - size * 0.35,
    width: size * 0.7, height: size * 0.7,
    strokeColor: '#D97706', backgroundColor: '#FCD34D', fillStyle: 'solid',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: sunBody
  });

  // Rays (wobbly lines radiating outward)
  for (let r = 0; r < 10; r++) {
    const angle = (r / 10) * Math.PI * 2 + gaussianRandom(0, 0.1);
    const innerR = size * 0.35;
    const outerR = size * 0.5 + gaussianRandom(0, size * 0.05);
    const ray = smoothHumanCurve([
      [cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR],
      [cx + Math.cos(angle) * ((innerR + outerR) / 2) + gaussianRandom(0, 3), cy + Math.sin(angle) * ((innerR + outerR) / 2) + gaussianRandom(0, 3)],
      [cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR]
    ], 2, 0.7, 0.4);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: cx - outerR - 5, y: cy - outerR - 5,
      width: outerR * 2 + 10, height: outerR * 2 + 10,
      strokeColor: '#F59E0B', backgroundColor: 'transparent', fillStyle: 'none',
      strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 80, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: ray
    });
  }

  return elements;
};


// ============================================================
// CLOUD GENERATION (human-like freehand)
// ============================================================

const generateCloud = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];

  // Cloud is multiple overlapping irregular circles
  const bumps = [
    { ox: -size * 0.3, oy: 0, r: size * 0.25 },
    { ox: -size * 0.05, oy: -size * 0.1, r: size * 0.3 },
    { ox: size * 0.25, oy: -size * 0.05, r: size * 0.28 },
    { ox: size * 0.45, oy: size * 0.05, r: size * 0.2 },
    { ox: -size * 0.15, oy: size * 0.1, r: size * 0.22 },
  ];

  bumps.forEach((bump, i) => {
    const bx = cx + bump.ox;
    const by = cy + bump.oy;
    const cloudPart = humanEllipse(bx, by, bump.r, bump.r * 0.7, 2.5);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: bx - bump.r - 5, y: by - bump.r - 5,
      width: bump.r * 2 + 10, height: bump.r * 2 + 10,
      strokeColor: '#9CA3AF', backgroundColor: i < 3 ? '#F3F4F6' : '#E5E7EB', fillStyle: 'solid',
      strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 80, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: cloudPart
    });
  });

  return elements;
};


// ============================================================
// MOUNTAIN GENERATION (human-like freehand)
// ============================================================

const generateMountain = (cx: number, cy: number, size: number, layerId: string) => {
  const w = size * 1.5;
  const h = size;
  const peakX = cx + gaussianRandom(0, w * 0.1);
  const peakY = cy - h;

  const mountain = humanFilledShape([
    [cx - w / 2, cy],
    [cx - w * 0.3 + gaussianRandom(0, 10), cy - h * 0.4 + gaussianRandom(0, 10)],
    [peakX, peakY],
    [cx + w * 0.3 + gaussianRandom(0, 10), cy - h * 0.35 + gaussianRandom(0, 10)],
    [cx + w / 2, cy]
  ], 3);

  return [{
    id: uuidv4(), type: 'free_draw',
    x: cx - w / 2 - 5, y: peakY - 5,
    width: w + 10, height: h + 10,
    strokeColor: '#374151', backgroundColor: '#6B7280', fillStyle: 'hachure',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 80, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: mountain
  }];
};


// ============================================================
// FLOWER GENERATION (human-like freehand)
// ============================================================

const generateFlower = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];

  // Stem (wobbly line)
  const stem = smoothHumanCurve([
    [cx, cy + size * 0.4],
    [cx + gaussianRandom(0, 5), cy + size * 0.2],
    [cx + gaussianRandom(0, 5), cy],
    [cx + gaussianRandom(0, 5), cy - size * 0.2],
  ], 2, 0.6, 0.7);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - 10, y: cy - size * 0.25,
    width: 20, height: size * 0.65,
    strokeColor: '#15803D', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: stem
  });

  // Petals (irregular ellipses)
  const petalCount = 5 + Math.floor(Math.random() * 3);
  const petalR = size * 0.15;
  for (let p = 0; p < petalCount; p++) {
    const angle = (p / petalCount) * Math.PI * 2 + gaussianRandom(0, 0.15);
    const px = cx + Math.cos(angle) * petalR * 1.2;
    const py = cy - size * 0.2 + Math.sin(angle) * petalR * 0.8;
    const petal = humanEllipse(px, py, petalR * (0.8 + Math.random() * 0.4), petalR * 0.7, 2);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: px - petalR - 5, y: py - petalR - 5,
      width: petalR * 2 + 10, height: petalR * 2 + 10,
      strokeColor: '#E11D48', backgroundColor: '#FDA4AF', fillStyle: 'solid',
      strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 90, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: petal
    });
  }

  // Center
  const center = humanCircle(cx, cy - size * 0.2, size * 0.06, 1.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.08, y: cy - size * 0.2 - size * 0.08,
    width: size * 0.16, height: size * 0.16,
    strokeColor: '#CA8A04', backgroundColor: '#FDE047', fillStyle: 'solid',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: center
  });

  // Leaf on stem
  const leafY = cy + size * 0.1;
  const leafSide = Math.random() > 0.5 ? 1 : -1;
  const leaf = smoothHumanCurve([
    [cx, leafY],
    [cx + leafSide * size * 0.1, leafY - size * 0.05],
    [cx + leafSide * size * 0.15, leafY + size * 0.02],
    [cx, leafY + size * 0.03]
  ], 2, 0.6, 0.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.2, y: leafY - size * 0.1,
    width: size * 0.35, height: size * 0.15,
    strokeColor: '#15803D', backgroundColor: '#86EFAC', fillStyle: 'solid',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 90, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: leaf
  });

  return elements;
};


// ============================================================
// CAT GENERATION (human-like freehand)
// ============================================================

const generateCat = (cx: number, cy: number, size: number, layerId: string) => {
  const elements: any[] = [];

  // Body (oval)
  const body = humanEllipse(cx, cy, size * 0.3, size * 0.2, 2.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - size * 0.35, y: cy - size * 0.25,
    width: size * 0.7, height: size * 0.5,
    strokeColor: '#374151', backgroundColor: '#D1D5DB', fillStyle: 'solid',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: body
  });

  // Head (circle)
  const headCy = cy - size * 0.3;
  const headR = size * 0.18;
  const head = humanCircle(cx, headCy, headR, 2.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - headR - 5, y: headCy - headR - 5,
    width: headR * 2 + 10, height: headR * 2 + 10,
    strokeColor: '#374151', backgroundColor: '#E5E7EB', fillStyle: 'solid',
    strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: head
  });

  // Ears (triangles)
  const earSize = size * 0.12;
  const leftEar = humanFilledShape([
    [cx - headR * 0.7, headCy - headR * 0.5],
    [cx - headR * 0.3, headCy - headR - earSize],
    [cx - headR * 0.1, headCy - headR * 0.5]
  ], 1.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - headR * 0.8, y: headCy - headR - earSize - 5,
    width: headR * 0.8, height: earSize + headR * 0.5 + 5,
    strokeColor: '#374151', backgroundColor: '#FCA5A5', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: leftEar
  });

  const rightEar = humanFilledShape([
    [cx + headR * 0.1, headCy - headR * 0.5],
    [cx + headR * 0.3, headCy - headR - earSize],
    [cx + headR * 0.7, headCy - headR * 0.5]
  ], 1.5);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx + headR * 0.05, y: headCy - headR - earSize - 5,
    width: headR * 0.8, height: earSize + headR * 0.5 + 5,
    strokeColor: '#374151', backgroundColor: '#FCA5A5', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: rightEar
  });

  // Eyes (almond shapes)
  const eyeSize = size * 0.04;
  const eyeY = headCy - size * 0.02;
  [-1, 1].forEach(side => {
    const eyeCx = cx + side * headR * 0.35;
    const eye = humanEllipse(eyeCx, eyeY, eyeSize, eyeSize * 1.3, 1);
    elements.push({
      id: uuidv4(), type: 'free_draw',
      x: eyeCx - eyeSize - 3, y: eyeY - eyeSize * 1.3 - 3,
      width: eyeSize * 2 + 6, height: eyeSize * 2.6 + 6,
      strokeColor: '#1f2937', backgroundColor: '#1f2937', fillStyle: 'solid',
      strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
      opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
      points: eye
    });
  });

  // Nose (small triangle)
  const noseSize = size * 0.025;
  const noseY = headCy + size * 0.04;
  const nose = humanFilledShape([
    [cx, noseY - noseSize],
    [cx - noseSize, noseY + noseSize * 0.5],
    [cx + noseSize, noseY + noseSize * 0.5]
  ], 1);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: cx - noseSize - 3, y: noseY - noseSize - 3,
    width: noseSize * 2 + 6, height: noseSize * 1.5 + 6,
    strokeColor: '#F472B6', backgroundColor: '#FBCFE8', fillStyle: 'solid',
    strokeWidth: 1, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: nose
  });

  // Whiskers
  [-1, 1].forEach(side => {
    for (let w = 0; w < 3; w++) {
      const wy = noseY + (w - 1) * size * 0.025;
      const whisker = smoothHumanCurve([
        [cx + side * headR * 0.15, wy],
        [cx + side * headR * 0.6, wy + gaussianRandom(0, 3)],
        [cx + side * headR * 1.0, wy + gaussianRandom(0, 5)]
      ], 1.5, 0.5, 0.3);
      elements.push({
        id: uuidv4(), type: 'free_draw',
        x: cx + side * headR * 0.1, y: wy - 10,
        width: headR * 0.9, height: 20,
        strokeColor: '#6B7280', backgroundColor: 'transparent', fillStyle: 'none',
        strokeWidth: 1, strokeStyle: 'solid', roughness: 1, seed: rand(),
        opacity: 60, cornerRadius: 0, layerId, strokeSharpness: 'round',
        points: whisker
      });
    }
  });

  // Tail (curved line)
  const tailStartX = cx + size * 0.25;
  const tailStartY = cy + size * 0.05;
  const tail = smoothHumanCurve([
    [tailStartX, tailStartY],
    [tailStartX + size * 0.2, tailStartY - size * 0.1],
    [tailStartX + size * 0.25, tailStartY - size * 0.25],
    [tailStartX + size * 0.15, tailStartY - size * 0.3],
    [tailStartX + size * 0.2, tailStartY - size * 0.2]
  ], 2.5, 0.6, 0.4);
  elements.push({
    id: uuidv4(), type: 'free_draw',
    x: tailStartX - 5, y: tailStartY - size * 0.35,
    width: size * 0.35, height: size * 0.4,
    strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none',
    strokeWidth: 3, strokeStyle: 'solid', roughness: 1, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
    points: tail
  });

  return elements;
};


// ============================================================
// MAIN MOCK GENERATION
// ============================================================

const mockGenerate = async (prompt: string, canvasSize: { width: number; height: number }): Promise<AIGenerateResult> => {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  const layerId = uuidv4();
  const cx = canvasSize.width / 2;
  const cy = canvasSize.height / 2;
  const elements: any[] = [];

  const lower = prompt.toLowerCase();

  // Background
  elements.push({
    id: uuidv4(), type: 'rectangle',
    x: 0, y: 0, width: canvasSize.width, height: canvasSize.height,
    strokeColor: 'transparent', backgroundColor: '#E0F2FE', fillStyle: 'solid',
    strokeWidth: 0, strokeStyle: 'solid', roughness: 0, seed: rand(),
    opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round'
  });

  // Keyword matching → generate human-like elements
  if (lower.includes('脸') || lower.includes('人') || lower.includes('头') || lower.includes('face')) {
    elements.push(...generateFace(cx, cy, 300, layerId));
  }

  if (lower.includes('猫') || lower.includes('小猫') || lower.includes('cat')) {
    elements.push(...generateCat(cx, cy + 100, 250, layerId));
  }

  if (lower.includes('房子') || lower.includes('小屋') || lower.includes('家') || lower.includes('house')) {
    elements.push(...generateHouse(cx, cy + 50, 280, layerId));
  }

  if (lower.includes('树') || lower.includes('tree')) {
    elements.push(...generateTree(cx - 250, cy + 100, 200, layerId));
    if (lower.includes('森林') || lower.includes('forest')) {
      elements.push(...generateTree(cx + 200, cy + 80, 180, layerId));
      elements.push(...generateTree(cx - 400, cy + 120, 160, layerId));
    }
  }

  if (lower.includes('太阳') || lower.includes('日') || lower.includes('sun')) {
    elements.push(...generateSun(cx + 300, cy - 200, 150, layerId));
  }

  if (lower.includes('云') || lower.includes('cloud')) {
    elements.push(...generateCloud(cx - 200, cy - 250, 120, layerId));
    if (lower.includes('白云') || lower.includes('多云')) {
      elements.push(...generateCloud(cx + 250, cy - 280, 100, layerId));
    }
  }

  if (lower.includes('山') || lower.includes('mountain')) {
    elements.push(...generateMountain(cx - 150, cy + 50, 200, layerId));
    elements.push(...generateMountain(cx + 200, cy + 70, 160, layerId));
  }

  if (lower.includes('花') || lower.includes('玫瑰') || lower.includes('向日葵') || lower.includes('flower')) {
    elements.push(...generateFlower(cx - 50, cy + 50, 200, layerId));
    if (lower.includes('花束') || lower.includes('bouquet')) {
      elements.push(...generateFlower(cx + 80, cy + 70, 170, layerId));
      elements.push(...generateFlower(cx - 150, cy + 80, 150, layerId));
    }
  }

  if (lower.includes('海') || lower.includes('浪') || lower.includes('sea') || lower.includes('wave')) {
    // Wavy sea lines
    for (let row = 0; row < 5; row++) {
      const waveY = cy + 150 + row * 30;
      const wave = smoothHumanCurve(
        Array.from({ length: 8 }, (_, i) => [
          canvasSize.width * 0.1 + i * (canvasSize.width * 0.1),
          waveY + Math.sin(i * 0.8) * 15 + gaussianRandom(0, 5)
        ] as [number, number]),
        2, 0.5, 0.4
      );
      elements.push({
        id: uuidv4(), type: 'free_draw',
        x: canvasSize.width * 0.05, y: waveY - 25,
        width: canvasSize.width * 0.9, height: 50,
        strokeColor: '#3B82F6', backgroundColor: 'transparent', fillStyle: 'none',
        strokeWidth: 2.5, strokeStyle: 'solid', roughness: 1, seed: rand(),
        opacity: 60 - row * 8, cornerRadius: 0, layerId, strokeSharpness: 'round',
        points: wave
      });
    }
  }

  // Fallback: if nothing matched, draw a simple scene
  if (elements.length <= 1) {
    elements.push(...generateSun(cx + 250, cy - 200, 120, layerId));
    elements.push(...generateCloud(cx - 150, cy - 220, 100, layerId));
    elements.push(...generateFlower(cx, cy + 100, 180, layerId));

    // Add the prompt text
    elements.push({
      id: uuidv4(), type: 'text',
      x: cx - 200, y: cy - 50, width: 400, height: 50,
      strokeColor: '#374151', backgroundColor: 'transparent', fillStyle: 'none',
      strokeWidth: 1, strokeStyle: 'solid', roughness: 0, seed: rand(),
      opacity: 100, cornerRadius: 0, layerId, strokeSharpness: 'round',
      text: prompt.slice(0, 15), fontSize: 28, fontFamily: 'Virgil', textAlign: 'center'
    });
  }

  return {
    layers: [{
      id: layerId,
      name: 'AI 生成',
      visible: true,
      elements
    }],
    description: `根据"${prompt}"生成的手绘风格草图`
  };
};


// ============================================================
// PUBLIC API
// ============================================================

export interface AIService {
  generateDrawing(prompt: string, canvasSize: { width: number; height: number }): Promise<AIGenerateResult>;
}

export const aiService: AIService = {
  generateDrawing: mockGenerate
};
