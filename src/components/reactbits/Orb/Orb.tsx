import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl';
import { useEffect, useRef } from 'react';

/**
 * Vendored from React Bits, and edited. Three changes, each for a reason this
 * project has already paid for once:
 *
 * 1. **Every prop was in the dependency array**, and every one of them is read
 *    inside the render loop anyway. Changing any prop tore down the WebGL
 *    context and rebuilt it for nothing. Exactly the shape of `SplashCursor`'s
 *    `BACK_COLOR` bug. The props travel in a ref now and the effect runs once.
 *
 * 2. **It listened on its own container**, so it only woke when the pointer was
 *    already inside its box. That is the behaviour the owner rejected on the
 *    Spline robot in as many words. It listens on the window and normalises
 *    against its own rect instead — the same fix `Galaxy` needed, for the same
 *    reason.
 *
 * 3. **`Orb.css` is gone.** Six lines setting `position: relative`, `z-index: 0`
 *    and `100%/100%`, which the caller can say in Tailwind and which `z-index`
 *    made a stacking context nobody asked for.
 *
 * Left alone deliberately: `gl_FragColor = vec4(col.rgb * col.a, col.a)` emits
 * real alpha, so this composites over the page with no box. That is the whole
 * reason it was chosen over `EvilEye`, which hardcodes alpha to 1.0 and can
 * only ever be an opaque rectangle.
 */
const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    uniform vec3 backgroundColor;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    
    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }
    
    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
    const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
    const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;

      float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));
      
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);

      v0 *= smoothstep(r0 * 1.05, r0, len);
      float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
      v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);
      
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      
      vec3 colBase = mix(color1, color2, cl);
      float fadeAmount = mix(1.0, 0.1, bgLuminance);
      
      vec3 darkCol = mix(color3, colBase, v0);
      darkCol = (darkCol + v1) * v2 * v3;
      darkCol = clamp(darkCol, 0.0, 1.0);
      
      vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
      lightCol = mix(backgroundColor, lightCol, v0);
      lightCol = clamp(lightCol, 0.0, 1.0);
      
      vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
      
      return extractAlpha(finalCol);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      
      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
      
      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
      
      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

export interface OrbProps {
  /** Degrees of hue rotation applied to the shader's base colours. */
  hue?: number;
  /** How far the surface distorts while the pointer is near. */
  hoverIntensity?: number;
  /** Spin the orb while it is being hovered. */
  rotateOnHover?: boolean;
  /** Hold the hover state on — used to show the effect without a pointer. */
  forceHoverState?: boolean;
  /**
   * Painted into the shader's output. It must match whatever the orb sits on,
   * because the shader adds it rather than compositing against it.
   */
  backgroundColor?: string;
  className?: string;
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = '#000000',
  className = '',
}: OrbProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  // The live props, readable from inside the render loop without being
  // dependencies of the effect that starts it.
  const props = useRef({ hue, hoverIntensity, rotateOnHover, forceHoverState, backgroundColor });

  // Updated from an effect rather than during render. Writing a ref while
  // rendering trips `react-hooks/refs`, and the rule is right — it breaks under
  // concurrent rendering. This effect is an assignment; the expensive one below
  // still never re-runs.
  useEffect(() => {
    props.current = { hue, hoverIntensity, rotateOnHover, forceHoverState, backgroundColor };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState, backgroundColor]);


  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        // Seeded from the ref too, not from the closure. Reading the props
        // directly here is what ESLint's exhaustive-deps rule would (correctly)
        // demand be listed as dependencies — and listing them would rebuild the
        // context on every prop change, which is the bug this edit removes.
        // Going through the ref means the effect closes over nothing.
        hue: { value: props.current.hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: props.current.hoverIntensity },
        backgroundColor: { value: hexToVec3(props.current.backgroundColor) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + 'px';
      gl.canvas.style.height = height + 'px';
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let lastBackground = props.current.backgroundColor;
    let currentRot = 0;
    const rotationSpeed = 0.3;

    // On the window, not on the container. Listening on the container means the
    // orb only reacts once the pointer is already inside its box — which is
    // precisely what the owner rejected on the robot: "ini tidak mengikuti
    // cursor setiap saat, hanya mengikuti ketika berada didekatnya."
    //
    // `Galaxy` needed this same change for a different reason (it sits at a
    // negative z-index, where hit testing means it can never receive a pointer
    // event at all) and the fix is the same either way: read the window, then
    // normalise against your own rect.
    //
    // The reach is deliberately wider than the orb. Distance is measured in the
    // orb's own units, so 0.8 is roughly its visible edge; REACH lets it notice
    // the pointer from about two radii away and ease in, rather than snapping
    // on at the boundary.
    const REACH = 2.2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      if (size === 0) return;

      const uvX = ((e.clientX - (rect.left + rect.width / 2)) / size) * 2.0;
      const uvY = ((e.clientY - (rect.top + rect.height / 2)) / size) * 2.0;
      const distance = Math.sqrt(uvX * uvX + uvY * uvY);

      // Ramps from 1 at the centre to 0 at REACH instead of a hard in/out, so
      // crossing the threshold does not make the surface jump.
      targetHover = Math.max(0, Math.min(1, (REACH - distance) / (REACH - 0.8)));
    };

    const handleMouseLeave = () => {
      targetHover = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let rafId: number;
    const update = (t: number) => {
      rafId = requestAnimationFrame(update);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;

      // Read through the ref, so none of these has to be an effect dependency.
      const live = props.current;

      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = live.hue;
      program.uniforms.hoverIntensity.value = live.hoverIntensity;

      // Only reparse when the string actually changes. Upstream called
      // hexToVec3 every frame, allocating a Vec3 sixty times a second for a
      // colour that changes approximately never.
      if (live.backgroundColor !== lastBackground) {
        lastBackground = live.backgroundColor;
        program.uniforms.backgroundColor.value = hexToVec3(lastBackground);
      }

      const effectiveHover = live.forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1;

      if (live.rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed;
      }
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // Deliberately empty. Every prop is read from `props.current` inside the
    // loop above, so nothing here closes over one — and a WebGL context is far
    // too expensive to rebuild because a number changed.
  }, []);

  return <div ref={ctnDom} className={`h-full w-full ${className}`} />;
}

function hslToRgb(h: number, s: number, l: number): Vec3 {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return new Vec3(r, g, b);
}

function hexToVec3(color: string): Vec3 {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return new Vec3(r, g, b);
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return new Vec3(parseInt(rgbMatch[1]) / 255, parseInt(rgbMatch[2]) / 255, parseInt(rgbMatch[3]) / 255);
  }

  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }

  return new Vec3(0, 0, 0);
}
