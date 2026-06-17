import GIF from 'gif.js';
import { renderScene } from './renderScene';
import { ExcalidrawElement } from '../types';

// Create an offscreen canvas for rendering frames
const createOffscreenCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Render a single frame to canvas
export const renderFrameToCanvas = (
  canvas: HTMLCanvasElement,
  elements: ExcalidrawElement[]
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render elements
  renderScene(ctx, elements, undefined, undefined, 0.3, '#ffffff');
};

// Export frames as GIF
export const exportFramesAsGif = async (
  frames: Array<{ elements: ExcalidrawElement[]; duration?: number }>,
  width: number = 1920,
  height: number = 1080
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create offscreen canvas
      const canvas = createOffscreenCanvas(width, height);
      
      // Create GIF instance
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        background: '#ffffff',
      });

      // Add each frame to GIF
      frames.forEach(frame => {
        // Render frame to canvas
        renderFrameToCanvas(canvas, frame.elements);
        
        // Add frame to GIF
        gif.addFrame(canvas, {
          delay: frame.duration ?? 200,
          copy: true,
        });
      });

      // On GIF completion
      gif.on('finished', (blob) => {
        // Create a URL for the GIF blob
        const url = URL.createObjectURL(blob);
        resolve(url);
      });

      // Start rendering
      gif.render();
    } catch (error) {
      console.error('Error exporting GIF:', error);
      reject(error);
    }
  });
};

// Trigger download of a blob URL
export const downloadBlob = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
