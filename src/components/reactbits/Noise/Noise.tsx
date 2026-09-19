import React, { useRef, useEffect } from 'react';

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let frameIndex = 0;
    let animationId: number;

    // Use patternSize (default 250px) instead of 1024 to save 94% memory and CPU
    const canvasSize = Math.min(patternSize || 250, 512);

    // Precompute 4 noise frames once on mount (takes <1ms once)
    // Eliminates 1,048,576 Math.random calls every 3 frames in the render loop!
    const NUM_FRAMES = 4;
    const cachedFrames: ImageData[] = [];

    for (let f = 0; f < NUM_FRAMES; f++) {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      cachedFrames.push(imageData);
    }

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        ctx.putImageData(cachedFrames[frameIndex % NUM_FRAMES], 0, 0);
        frameIndex++;
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      className="pointer-events-none absolute top-0 left-0 h-screen w-screen"
      ref={grainRef}
      style={{
        imageRendering: 'pixelated'
      }}
    />
  );
};

export default Noise;
