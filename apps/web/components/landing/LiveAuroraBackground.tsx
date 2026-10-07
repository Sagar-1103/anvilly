"use client";

import React, { useEffect, useRef } from "react";

// WebGL Vertex Shader
const VS_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = vec2((a_position.x + 1.0) * 0.5, 1.0 - (a_position.y + 1.0) * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// WebGL Fragment Shader with Autonomous Fluid Silk Smoke & Breathing Aurora
const FS_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture;
uniform float u_has_texture;

varying vec2 v_uv;

// Simplex / Perlin noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.55;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.05;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = v_uv;

  // 1. Organic Silky Fluid Wave Motion (slow, hypnotic, breathing drift)
  float t = u_time * 0.32;
  float breath = 0.88 + 0.12 * sin(u_time * 0.38);

  float wave1 = sin(uv.y * 3.4 + t * 0.8) * 0.015 + cos(uv.x * 4.6 - t * 0.5) * 0.011;
  float wave2 = cos(uv.x * 3.2 + t * 0.6) * 0.016 + sin(uv.y * 3.8 - t * 0.4) * 0.013;
  
  // Secondary subtle micro-folds & silk sheen
  float microFold = snoise(uv * 5.2 + vec2(t * 0.22, -t * 0.16)) * 0.008;
  vec2 waveOffset = vec2(wave1 + microFold, wave2 + microFold * 0.7) * breath;

  vec2 displacedUV = uv + waveOffset;

  // 2. Sample the Silky Aurora Texture (hero-aurora.webp) with Fluid Distortion
  vec4 texColor = vec4(0.0);
  if (u_has_texture > 0.5) {
    float screenW = u_resolution.x;
    float screenH = u_resolution.y;

    float bannerW = max(screenW, 1400.0);
    float bannerH = 820.0 * (bannerW / 1920.0);
    if (bannerH < 700.0) bannerH = 700.0;

    float bannerX0 = (screenW - bannerW) * 0.5;
    float bannerY0 = -45.0;

    float px = displacedUV.x * screenW;
    float py = displacedUV.y * screenH;

    vec2 texUV = vec2((px - bannerX0) / bannerW, (py - bannerY0) / bannerH);

    if (texUV.x >= 0.0 && texUV.x <= 1.0 && texUV.y >= 0.0 && texUV.y <= 1.0) {
      // Subtle chromatic dispersion on the silky edges
      float r = texture2D(u_texture, texUV + vec2(0.002, 0.0)).r;
      float g = texture2D(u_texture, texUV).g;
      float b = texture2D(u_texture, texUV - vec2(0.002, 0.0)).b;
      float a = texture2D(u_texture, texUV).a;

      // Soft vertical & horizontal falloff into background
      float vertFade = smoothstep(0.96, 0.56, texUV.y);
      float horizFade = smoothstep(0.0, 0.06, texUV.x) * smoothstep(1.0, 0.94, texUV.x);
      float totalMask = vertFade * horizFade;

      texColor = vec4(vec3(r, g, b) * totalMask, a * totalMask);
    }
  }

  // 3. Procedural Luminous Aurora Stream along the Silk Wave Path
  float diagCoord = (displacedUV.x * 0.65 + (1.0 - displacedUV.y) * 0.85);
  float streamNoise = fbm(vec2(diagCoord * 2.8 - t * 0.18, displacedUV.y * 2.2 + t * 0.12));
  
  float ribbonBand = smoothstep(0.1, 0.7, streamNoise) * smoothstep(0.85, 0.15, displacedUV.y) * breath;

  // Ethereal violet palette
  vec3 colDeepViolet = vec3(0.06, 0.01, 0.13);
  vec3 colAmethyst   = vec3(0.32, 0.09, 0.58);
  vec3 colBrightV    = vec3(0.64, 0.22, 0.92);
  vec3 colShimmer    = vec3(0.88, 0.74, 1.00);

  vec3 auroraCol = mix(colDeepViolet, colAmethyst, ribbonBand);
  auroraCol = mix(auroraCol, colBrightV, pow(ribbonBand, 2.5));
  auroraCol += colShimmer * pow(ribbonBand, 5.0) * 0.38;

  // 4. Base Void & Master Composite
  vec3 baseVoid = vec3(0.012, 0.0, 0.024); // #030006

  vec3 finalColor = baseVoid;
  finalColor += auroraCol * 0.38;
  finalColor += texColor.rgb * 0.94;

  // Vignette: dissolve outer edges smoothly into base background #030006
  float edgeFadeX = smoothstep(0.0, 0.04, uv.x) * smoothstep(1.0, 0.96, uv.x);
  float edgeFadeY = smoothstep(1.0, 0.62, uv.y);
  float totalVignette = edgeFadeX * edgeFadeY;

  finalColor = mix(baseVoid, finalColor, totalVignette);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Particle interface
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

export default function LiveAuroraBackground() {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = glCanvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      console.warn("WebGL not supported for aurora background, falling back.");
      return;
    }

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uTexture = gl.getUniformLocation(program, "u_texture");
    const uHasTexture = gl.getUniformLocation(program, "u_has_texture");

    // Texture setup for /hero-aurora.webp
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initial 1x1 black fallback pixel
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([3, 0, 6, 255])
    );
    gl.uniform1f(uHasTexture, 0.0);

    let isTextureLoaded = false;
    const img = new Image();
    img.src = "/hero-aurora.webp";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      isTextureLoaded = true;
    };

    // Resize handler
    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Particle setup on 2D overlay canvas
    const pCanvas = particleCanvasRef.current;
    const ctx = pCanvas?.getContext("2d");

    const particleColors = [
      "rgba(192, 132, 252,", // #c084fc Lavender
      "rgba(168, 85, 247,",  // #a855f7 Vibrant violet
      "rgba(216, 180, 254,", // #d8b4fe Soft amethyst
      "rgba(255, 255, 255,", // #ffffff Pure spark
      "rgba(147, 51, 234,",  // #9333ea Electric purple
    ];

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight ? window.innerHeight * 0.75 : 650),
        vx: -(0.14 + Math.random() * 0.3),
        vy: (Math.random() - 0.42) * 0.12,
        size: 1.1 + Math.random() * 2.0,
        alpha: 0.15 + Math.random() * 0.5,
        baseAlpha: 0.15 + Math.random() * 0.5,
        twinkleSpeed: 0.015 + Math.random() * 0.025,
        twinklePhase: Math.random() * Math.PI * 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]!,
      });
    }

    // Animation Loop
    const startTime = performance.now();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (now: number) => {
      animFrameRef.current = requestAnimationFrame(render);
      if (!isTabVisible) return;

      const elapsed = (now - startTime) * 0.001;

      // Render WebGL Living Aurora
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uHasTexture, isTextureLoaded ? 1.0 : 0.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTexture, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Render Particle Overlay on 2D canvas
      if (pCanvas && ctx) {
        const pDpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const pW = window.innerWidth;
        const pH = window.innerHeight;

        if (pCanvas.width !== Math.floor(pW * pDpr) || pCanvas.height !== Math.floor(pH * pDpr)) {
          pCanvas.width = Math.floor(pW * pDpr);
          pCanvas.height = Math.floor(pH * pDpr);
        }

        ctx.save();
        ctx.scale(pDpr, pDpr);
        ctx.clearRect(0, 0, pW, pH);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;

          // Autonomous gentle cosmic flow
          p.x += p.vx;
          p.y += p.vy;

          // Twinkle effect
          p.twinklePhase += p.twinkleSpeed;
          const currentAlpha = Math.max(
            0.05,
            p.baseAlpha * (0.65 + 0.35 * Math.sin(p.twinklePhase))
          );

          // Wrap boundaries
          if (p.x < -20) p.x = pW + 20;
          if (p.x > pW + 20) p.x = -20;
          if (p.y < -20) p.y = pH * 0.8;
          if (p.y > pH * 0.8) p.y = -20;

          // Draw Glowing Stardust Spark
          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 3.2
          );
          grad.addColorStop(0, `${p.color} ${currentAlpha})`);
          grad.addColorStop(0.35, `${p.color} ${currentAlpha * 0.45})`);
          grad.addColorStop(1, `${p.color} 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2);
          ctx.fill();

          // Crisp core spark
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", updateSize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(texture);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* 1. Primary Live WebGL Aurora Canvas */}
      <canvas
        ref={glCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: "block" }}
      />

      {/* 2. Autonomous Luminescent Stardust & Sparks Overlay */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
        style={{ display: "block" }}
      />

      {/* 3. Deep Atmospheric Lavender Radial Glows */}
      <div
        className="absolute -top-[120px] right-[5%] w-[800px] h-[600px] pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.14) 0%, rgba(59, 7, 100, 0.05) 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
      />

      {/* 4. Precision Blueprint Grid (Illuminated by ambient light) */}
      <div className="absolute inset-0 hero-grid opacity-14 [mask-image:radial-gradient(1100px_650px_at_50%_280px,black_20%,transparent_100%)] pointer-events-none" />

      {/* 5. Seamless bottom gradient blending into content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #030006 90%)",
        }}
      />
    </div>
  );
}
