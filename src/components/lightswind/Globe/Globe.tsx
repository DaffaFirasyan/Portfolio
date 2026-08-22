import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

/**
 * Vendored from Lightswind, and edited. Installed by hand rather than through
 * `npx lightswind add`, for the same reasons the Comet card was: this project
 * has no `components.json`, keeps components under `src/components/`, has no
 * `cn` helper, and configures Tailwind v4 from CSS with no JS config to edit.
 *
 * **Only `cobe` was installed.** The registry also lists `clsx` and
 * `tailwind-merge`, and both exist solely to build `cn` — two packages for one
 * `join(' ')`. `cobe` itself is the real dependency and it is small: 19 KB
 * unpacked, a WebGL globe rather than a scene graph. That distinction is why
 * this is acceptable at all on a page that just shed 1.4 MB of Spline.
 *
 * Three edits:
 *
 * 1. `cn` replaced with a filtered join.
 * 2. `"use client"` removed — a Next.js directive, and this is Vite.
 * 3. `useRef<any>` given cobe's actual return type, so the file no longer needs
 *    an eslint exception for `no-explicit-any`.
 *
 * **`cobe` is pinned to 0.6.5 and must stay there until this file is rewritten.**
 * The registry lists `cobe` with no version, so `npm i cobe` installs 2.0.1 —
 * and 2.x removed `onRender`, which is the callback every moving part of this
 * component lives inside. Verified in the installed package rather than
 * assumed: `onRender` appears zero times in 2.0.1's bundle *and* zero times in
 * its types, and 2.x ships no `requestAnimationFrame` of its own either, so the
 * caller must drive it through `update()`. On 2.x this globe would draw one
 * frame and freeze — no rotation, no drag, no zoom — with nothing throwing and
 * nothing to see in a test. Moving to 2.x means rewriting the loop here, not
 * bumping a number.
 *
 * **Left alone but load-bearing for the caller:** `enableZoom` defaults to
 * `true`, and its wheel handler calls `preventDefault()`. On a page with smooth
 * scrolling that means the wheel stops scrolling the page whenever the pointer
 * is over the globe. `GlobeMark` passes `enableZoom={false}` for exactly that
 * reason; anything else mounting this must decide the same thing deliberately.
 */

// Utility function to convert a hex color string to a normalized RGB array [0-1, 0-1, 0-1]
const hexToRgbNormalized = (hex: string): [number, number, number] => {
  // Upstream initialised these to 0 and then assigned every branch below
  // without ever reading the initial value, which `no-useless-assignment`
  // flags correctly.
  let r: number;
  let g: number;
  let b: number;

  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return [0.4, 0.65, 1];
  }

  return [r / 255, g / 255, b / 255];
};

export interface GlobeMarker {
  location: [number, number];
  size: number;
}

export interface GlobeProps {
  className?: string;
  theta?: number;
  phi?: number;
  dark?: number;
  scale?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number] | string;
  markerColor?: [number, number, number] | string;
  glowColor?: [number, number, number] | string;
  markers?: GlobeMarker[];
  
  /** Enable mouse wheel and pinch zoom */
  enableZoom?: boolean;
  /** Minimum zoom scale */
  minScale?: number;
  /** Maximum zoom scale */
  maxScale?: number;
  /** Zoom sensitivity multiplier */
  zoomSensitivity?: number;
  /** Enable auto rotation */
  autoRotate?: boolean;
  /** Auto rotation speed */
  autoRotateSpeed?: number;
}

const Globe: React.FC<GlobeProps> = ({
  className,
  theta = 0.25,
  phi = 0,
  dark = 0,
  scale = 1.1,
  diffuse = 1.2,
  mapSamples = 60000,
  mapBrightness = 10,
  baseColor = "#ffffff",
  markerColor = "#ff3b30",
  glowColor = "#ffffff",
  markers = [],
  enableZoom = true,
  minScale = 0.4,
  maxScale = 3.5,
  zoomSensitivity = 0.002,
  autoRotate = true,
  autoRotateSpeed = 0.003,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

  // Interaction refs
  const phiRef = useRef(phi);
  const thetaRef = useRef(theta);
  const targetScaleRef = useRef(scale);
  const currentScaleRef = useRef(scale);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  // Synchronize initial prop scale
  useEffect(() => {
    targetScaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Normalize color props
    const resolvedBaseColor: [number, number, number] =
      typeof baseColor === "string" ? hexToRgbNormalized(baseColor) : baseColor;

    const resolvedMarkerColor: [number, number, number] =
      typeof markerColor === "string" ? hexToRgbNormalized(markerColor) : markerColor;

    const resolvedGlowColor: [number, number, number] =
      typeof glowColor === "string" ? hexToRgbNormalized(glowColor) : glowColor;

    const initGlobe = () => {
      if (globeRef.current) {
        globeRef.current.destroy();
        globeRef.current = null;
      }

      const rect = canvas.getBoundingClientRect();
      const width = Math.max(100, Math.round(rect.width || 600));
      const height = Math.max(100, Math.round(rect.height || 500));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const internalWidth = Math.round(width * dpr);
      const internalHeight = Math.round(height * dpr);

      canvas.width = internalWidth;
      canvas.height = internalHeight;

      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: internalWidth,
        height: internalHeight,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: dark,
        scale: currentScaleRef.current,
        diffuse: diffuse,
        mapSamples: mapSamples,
        mapBrightness: mapBrightness,
        baseColor: resolvedBaseColor,
        markerColor: resolvedMarkerColor,
        glowColor: resolvedGlowColor,
        opacity: 1,
        offset: [0, 0],
        markers: markers,
        onRender: (state: Record<string, number>) => {
          // Smooth zoom interpolation (lerp) for high-fps fluid zooming
          currentScaleRef.current +=
            (targetScaleRef.current - currentScaleRef.current) * 0.12;

          if (!isDragging.current && autoRotate) {
            phiRef.current += autoRotateSpeed;
          }
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
          state.scale = currentScaleRef.current;
          state.width = internalWidth;
          state.height = internalHeight;
        },
      });
    };

    // --- Mouse Drag Interaction Handlers ---
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
      canvas.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouseX.current;
        const deltaY = e.clientY - lastMouseY.current;
        const rotationSpeed = 0.005;

        phiRef.current += deltaX * rotationSpeed;
        thetaRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, thetaRef.current - deltaY * rotationSpeed)
        );

        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = "grab";
    };

    const onMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        canvas.style.cursor = "grab";
      }
    };

    // --- Mouse Wheel Zoom Interaction Handler ---
    const onWheel = (e: WheelEvent) => {
      if (!enableZoom) return;
      e.preventDefault();
      const zoomDelta = -e.deltaY * zoomSensitivity;
      const nextScale = targetScaleRef.current + zoomDelta;
      targetScaleRef.current = Math.max(minScale, Math.min(maxScale, nextScale));
    };

    // --- Touch Interaction (Drag + Pinch to Zoom) ---
    let touchDistance = 0;
    let initialTouchScale = 1;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMouseX.current = e.touches[0].clientX;
        lastMouseY.current = e.touches[0].clientY;
      } else if (e.touches.length === 2 && enableZoom) {
        isDragging.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistance = Math.hypot(dx, dy);
        initialTouchScale = targetScaleRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        const deltaX = e.touches[0].clientX - lastMouseX.current;
        const deltaY = e.touches[0].clientY - lastMouseY.current;
        const rotationSpeed = 0.005;

        phiRef.current += deltaX * rotationSpeed;
        thetaRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, thetaRef.current - deltaY * rotationSpeed)
        );

        lastMouseX.current = e.touches[0].clientX;
        lastMouseY.current = e.touches[0].clientY;
      } else if (e.touches.length === 2 && enableZoom && touchDistance > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / touchDistance;
        const nextScale = initialTouchScale * factor;
        targetScaleRef.current = Math.max(minScale, Math.min(maxScale, nextScale));
      }
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      touchDistance = 0;
    };

    initGlobe();

    // Attach interaction listeners
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    const handleResize = () => {
      initGlobe();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseLeave);
        canvas.removeEventListener("wheel", onWheel);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
      }
      if (globeRef.current) {
        globeRef.current.destroy();
        globeRef.current = null;
      }
    };
  }, [
    theta,
    dark,
    diffuse,
    mapSamples,
    mapBrightness,
    baseColor,
    markerColor,
    glowColor,
    enableZoom,
    minScale,
    maxScale,
    zoomSensitivity,
    autoRotate,
    autoRotateSpeed,
    markers,
  ]);

  return (
    <div
      className={['relative flex h-full w-full items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "grab",
        }}
      />
    </div>
  );
};

export default Globe;
