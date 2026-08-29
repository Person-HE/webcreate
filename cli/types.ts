import { ExcalidrawElement } from '../types';
import { AnimationEasingConfig } from '../utils/tweenAnimation';

export interface WebCreateImageInput {
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
  layers: Array<{
    id?: string;
    name?: string;
    visible?: boolean;
    elements: ExcalidrawElement[];
  }>;
  description?: string;
}

export interface WebCreateGifInput extends WebCreateImageInput {
  animationConfig?: {
    duration?: number;
    delayMs?: number;
    easingConfig?: AnimationEasingConfig;
  };
}

export interface WebCreateVideoInput extends WebCreateImageInput {
  animationConfig?: {
    fps?: number;
    duration?: number;
    easingConfig?: AnimationEasingConfig;
    trail?: {
      enabled?: boolean;
      trailCount?: number;
      trailDecay?: number;
      speedThreshold?: number;
    };
    stagger?: {
      enabled?: boolean;
      delayPerElement?: number;
      maxDelay?: number;
    };
  };
}

export interface RenderOptions {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface VideoRenderOptions extends RenderOptions {
  fps: number;
  duration: number;
  outputPath: string;
}

export interface ImageRenderOptions extends RenderOptions {
  outputPath: string;
}

export type OutputFormat = 'png' | 'jpeg' | 'webp';
