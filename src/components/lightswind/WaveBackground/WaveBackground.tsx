import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform float iMouseStrength;

uniform vec3 u_colorVoid;
uniform vec3 u_colorWave;
uniform vec3 u_colorAccent;

varying vec2 vUv;

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec2 mouseUV = (2.0 * iMouse - iResolution.xy) / min(iResolution.x, iResolution.y);

    float dist = length(uv - mouseUV);
    vec2 dir = (uv - mouseUV) / (dist + 0.0001);

    // Gentle wave distortion radiating from mouse position
    float influence = exp(-dist * dist * 3.0) * iMouseStrength;
    uv += dir * influence * 0.18 * sin(dist * 8.0 - iTime * 3.5);

    // Multi-frequency sinusoidal fluid distortion (Lightswind 6-iteration fluid wave)
    float waveDistortion = 0.0;
    for (int i = 1; i < 7; i++) {
        float fi = float(i);
        waveDistortion += (0.12 / fi) * 
            sin(uv.x * fi * 1.8 + iTime * 0.35) * 
            cos(uv.y * fi * 1.4 + iTime * 0.3);
    }

    float wave = uv.y + waveDistortion;

    // Base background: Deep cosmic void (#0a0c10)
    vec3 col = u_colorVoid;

    // Layer 1: Fluid wave volume in deep space navy slate (#111722)
    float waveBand = smoothstep(-0.8, 0.6, wave);
    col = mix(col, u_colorWave, waveBand * 0.7);

    // Layer 2: Ethereal cosmic silver/slate starlight crest (replaces warm amber)
    float crest = exp(-abs(wave - 0.15) * 5.0);
    float crestGlow = exp(-abs(wave - 0.15) * 1.8) * 0.18;
    col += u_colorAccent * (crest * 0.22 + crestGlow);

    // Delicate cosmic starlight pinpoints (smooth circular dots like Galaxy)
    vec2 gridId = floor(uv * 45.0);
    float starSeed = fract(sin(dot(gridId, vec2(12.9898, 78.233))) * 43758.5453);
    if (starSeed > 0.982) {
        vec2 gv = fract(uv * 45.0) - 0.5;
        vec2 starOffset = vec2(fract(starSeed * 34.2) - 0.5, fract(starSeed * 78.4) - 0.5) * 0.6;
        float d = length(gv - starOffset);
        float star = smoothstep(0.04, 0.005, d);
        float twinkle = 0.5 + 0.5 * sin(iTime * (1.8 + starSeed * 3.0) + starSeed * 6.28);
        col += vec3(0.92, 0.96, 1.0) * star * twinkle * 0.75;
    }

    // Interactive pointer starlight glow (cool cosmic silver-cyan glow)
    float pointerGlow = exp(-dist * dist * 4.5) * iMouseStrength;
    col += vec3(0.5, 0.65, 0.85) * pointerGlow * 0.25;

    gl_FragColor = vec4(col, 1.0);
}
`;

export type BlurSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface WaveBackgroundProps {
  active?: boolean;
  backdropBlurAmount?: BlurSize;
  className?: string;
  colors?: [string, string, string];
  interactive?: boolean;
  mouseInteraction?: boolean;
}

const blurClassMap: Record<BlurSize, string> = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl',
};

export default function WaveBackground({
  active = true,
  backdropBlurAmount = 'sm',
  className = '',
  // Default cosmic palette matching previous Galaxy: dark void, deep space navy, and cool starlight silver
  colors = ['#0a0c10', '#111722', '#7b92a8'],
  interactive,
  mouseInteraction,
}: WaveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractive = interactive ?? mouseInteraction ?? true;

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const mouseStrengthRef = useRef({ value: 0, targetValue: 0 });
  const activeRef = useRef(active);

  const renderRef = useRef<((time: number) => void) | null>(null);
  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let animationFrameId: number;

    const testCanvas = document.createElement('canvas');
    const isWebGLAvailable = !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
    );
    if (!isWebGLAvailable) return;

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0.04, 0.048, 0.063, 1.0); // #0a0c10

    const geometry = new Triangle(gl);

    const [c1, c2, c3] = colors;
    const colorVoid = new Color(c1);
    const colorWave = new Color(c2);
    const colorAccent = new Color(c3);

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;
    renderer.setSize(width, height);

    let program: Program;
    try {
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          iResolution: { value: new Float32Array([width, height]) },
          iTime: { value: 0 },
          iMouse: { value: new Float32Array([width * 0.5, height * 0.5]) },
          iMouseStrength: { value: 0 },
          u_colorVoid: { value: colorVoid },
          u_colorWave: { value: colorWave },
          u_colorAccent: { value: colorAccent },
        },
      });
    } catch {
      return;
    }

    const mesh = new Mesh(gl, { geometry, program });

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 200;
      renderer.setSize(w, h);
      program.uniforms.iResolution.value[0] = w;
      program.uniforms.iResolution.value[1] = h;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInteractive || !container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = rect.height - (e.clientY - rect.top);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    const handleMouseEnter = () => {
      if (!isInteractive) return;
      mouseStrengthRef.current.targetValue = 1.0;
    };

    const handleMouseLeave = () => {
      if (!isInteractive) return;
      mouseStrengthRef.current.targetValue = 0.0;
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const startTime = performance.now();

    const render = (time: number) => {
      if (!activeRef.current) {
        animationFrameId = 0;
        animationFrameIdRef.current = 0;
        return;
      }

      const currentTime = (time - startTime) * 0.001;

      // Lerp mouse target values for fluid interaction
      const mouse = mouseRef.current;
      const mouseStrength = mouseStrengthRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      mouseStrength.value += (mouseStrength.targetValue - mouseStrength.value) * 0.08;

      program.uniforms.iTime.value = currentTime;
      program.uniforms.iMouse.value[0] = mouse.x;
      program.uniforms.iMouse.value[1] = mouse.y;
      program.uniforms.iMouseStrength.value = mouseStrength.value;

      renderer?.render({ scene: mesh });
      animationFrameId = requestAnimationFrame(render);
      animationFrameIdRef.current = animationFrameId;
    };

    renderRef.current = render;

    if (activeRef.current) {
      animationFrameId = requestAnimationFrame(render);
      animationFrameIdRef.current = animationFrameId;
    }
    container.appendChild(gl.canvas);
    gl.canvas.className = 'absolute inset-0 h-full w-full';

    return () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameIdRef.current = 0;
      renderRef.current = null;
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);

      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [colors, isInteractive]);

  // Resume or pause the render loop seamlessly without recompiling shaders or losing WebGL context
  useEffect(() => {
    activeRef.current = active;
    if (active && renderRef.current && !animationFrameIdRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderRef.current);
    }
  }, [active]);

  const finalBlurClass = blurClassMap[backdropBlurAmount] || blurClassMap.sm;

  return (
    <div ref={containerRef} className={`absolute inset-0 h-full w-full overflow-hidden bg-[#0a0c10] ${className}`}>
      <div className={`pointer-events-none absolute inset-0 ${finalBlurClass}`} />
    </div>
  );
}
