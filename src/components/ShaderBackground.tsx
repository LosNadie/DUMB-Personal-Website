import { useEffect, useRef } from 'react'

const vertexShaderSource = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;

const float cloudscale = 1.1;
const float speed = 0.03;
const float clouddark = 0.5;
const float cloudlight = 0.3;
const float cloudcover = 0.2;
const float cloudalpha = 8.0;
const float skytint = 0.5;
const vec3 skycolour1 = vec3(0.2, 0.4, 0.6);
const vec3 skycolour2 = vec3(0.4, 0.7, 1.0);

const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 n) {
  float total = 0.0;
  float amplitude = 0.1;
  for (int i = 0; i < 7; i++) {
    total += noise(n) * amplitude;
    n = m * n;
    amplitude *= 0.4;
  }
  return total;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = fragCoord.xy / iResolution.xy;
  vec2 uv = p * vec2(iResolution.x / iResolution.y, 1.0);
  float time = iTime * speed;
  float q = fbm(uv * cloudscale * 0.5);

  float r = 0.0;
  uv *= cloudscale;
  uv -= q - time;
  float weight = 0.8;
  for (int i = 0; i < 8; i++) {
    r += abs(weight * noise(uv));
    uv = m * uv + time;
    weight *= 0.7;
  }

  float f = 0.0;
  uv = p * vec2(iResolution.x / iResolution.y, 1.0);
  uv *= cloudscale;
  uv -= q - time;
  weight = 0.7;
  for (int i = 0; i < 8; i++) {
    f += weight * noise(uv);
    uv = m * uv + time;
    weight *= 0.6;
  }

  f *= r + f;

  float c = 0.0;
  time = iTime * speed * 2.0;
  uv = p * vec2(iResolution.x / iResolution.y, 1.0);
  uv *= cloudscale * 2.0;
  uv -= q - time;
  weight = 0.4;
  for (int i = 0; i < 7; i++) {
    c += weight * noise(uv);
    uv = m * uv + time;
    weight *= 0.6;
  }

  float c1 = 0.0;
  time = iTime * speed * 3.0;
  uv = p * vec2(iResolution.x / iResolution.y, 1.0);
  uv *= cloudscale * 3.0;
  uv -= q - time;
  weight = 0.4;
  for (int i = 0; i < 7; i++) {
    c1 += abs(weight * noise(uv));
    uv = m * uv + time;
    weight *= 0.6;
  }

  c += c1;

  vec3 skycolour = mix(skycolour2, skycolour1, p.y);
  vec3 cloudcolour = vec3(1.1, 1.1, 0.9) * clamp((clouddark + cloudlight * c), 0.0, 1.0);

  f = cloudcover + cloudalpha * f * r;

  vec3 result = mix(skycolour, clamp(skytint * skycolour + cloudcolour, 0.0, 1.0), clamp(f + c, 0.0, 1.0));
  fragColor = vec4(result, 1.0);
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('无法创建 shader。')
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || '未知编译错误'
    gl.deleteShader(shader)
    throw new Error(info)
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    throw new Error('无法创建 program。')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) || '未知链接错误'
    gl.deleteProgram(program)
    throw new Error(info)
  }

  return program
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const gl = canvas.getContext('webgl')
    if (!gl) {
      return
    }

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)
    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    if (!positionBuffer) {
      gl.deleteProgram(program)
      return
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const positionLocation = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'iResolution')
    const timeLocation = gl.getUniformLocation(program, 'iTime')
    const startedAt = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.floor(rect.width * dpr))
      const height = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
      gl.uniform2f(resolutionLocation, width, height)
    }

    resize()
    window.addEventListener('resize', resize)

    let rafId = 0
    const render = () => {
      const elapsedSeconds = (performance.now() - startedAt) / 1000
      gl.uniform1f(timeLocation, elapsedSeconds)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 h-full w-full object-cover" aria-hidden="true" />
}
