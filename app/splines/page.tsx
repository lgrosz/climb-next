'use client';

import { useEffect, useRef } from 'react';
import vertexShaderSource from "./spline.vert.glsl";
import fragmentShaderSource from "./spline.frag.glsl";

type Point = [number, number];

// De Boor's algorithm for B-spline evaluation
function deBoor(
  t: number,
  degree: number,
  controlPoints: Point[],
  knots: number[]
): Point {
  const n = controlPoints.length - 1;

  // Find the knot span index `k`
  let k = -1;
  for (let i = degree; i <= n; i++) {
    if (t >= knots[i] && t < knots[i + 1]) {
      k = i;
      break;
    }
  }
  if (t === knots[knots.length - 1]) {
    k = n;
  }
  if (k === -1) throw new Error(`t=${t} is out of bounds`);

  // Copy affected control points
  const d: Point[] = [];
  for (let j = 0; j <= degree; j++) {
    d[j] = [...controlPoints[k - degree + j]];
  }

  // De Boor iterations
  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const i = k - degree + j;
      const alpha =
        (t - knots[i]) / (knots[i + degree - r + 1] - knots[i]) || 0;

      d[j][0] = (1 - alpha) * d[j - 1][0] + alpha * d[j][0];
      d[j][1] = (1 - alpha) * d[j - 1][1] + alpha * d[j][1];
    }
  }

  return d[degree];
}

// Function to sample the B-spline curve at several points
function sampleBSpline(
  controlPoints: Point[],
  knots: number[],
  degree: number,
  sampleCount: number = 100
): Point[] {
  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];

  const samples: Point[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = tMin + (tMax - tMin) * (i / sampleCount);
    const pt = deBoor(t, degree, controlPoints, knots);
    samples.push(pt);
  }

  return samples;
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Example control points, degree, and knot vector
    const controlPoints: Point[] = [
      [0.1, 0.7],
      [0.3, 0.9],
      [0.5, 0.5],
      [0.7, 0.9],
      [0.9, 0.6],
    ];

    const knots: number[] = [0, 0, 0, 1, 2, 3, 3, 3]; // Open knot vector
    const degree = 2; // Quadratic B-spline

    // Sample the B-spline curve
    const splinePoints = sampleBSpline(controlPoints, knots, degree);

    // Flatten spline points into a buffer
    const flatPoints = new Float32Array(splinePoints.flat());

    // Create the buffer for the points
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.error('ERROR creating buffer');
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatPoints, gl.STATIC_DRAW);

    // Vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      console.error('ERROR creating vertex shader');
      return;
    }
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vertexShader));
      return;
    }

    // Fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      console.error('ERROR creating fragment shader');
      return;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Shader program
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) {
      console.error('ERROR creating shader program');
      return;
    }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('ERROR linking program', gl.getProgramInfoLog(shaderProgram));
      return;
    }

    gl.useProgram(shaderProgram);

    // Bind position attribute
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Clear the canvas and draw the B-spline as a line strip
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_STRIP, 0, splinePoints.length);

  }, []);

  return (
    <div>
      <h1>WebGL B-Spline Example</h1>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

