'use client';

import { useEffect, useRef } from 'react';
import { BasisSpline } from '@/lib/BasisSpline';
import vertexShaderSource from './spline.vert.glsl';
import fragmentShaderSource from './spline.frag.glsl';

type Point = [number, number];

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let controlPoints: Point[] = [
      [0.1, 0.7],
      [0.3, 0.9],
      [0.5, 0.5],
      [0.7, 0.9],
      [0.9, 0.6],
    ];

    const spline = new BasisSpline(controlPoints, 2);

    const vertexBuffer = gl.createBuffer();
    const controlPointsBuffer = gl.createBuffer();
    if (!vertexBuffer || !controlPointsBuffer) {
      console.error('ERROR creating buffers');
      return;
    }

    function updateBuffers(): void {
      const points = spline.sample();
      gl?.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl?.bufferData(gl.ARRAY_BUFFER, new Float32Array(points.flat()), gl.STATIC_DRAW);
      gl?.bindBuffer(gl.ARRAY_BUFFER, controlPointsBuffer);
      gl?.bufferData(gl.ARRAY_BUFFER, new Float32Array(controlPoints.flat()), gl.STATIC_DRAW);
    }

    function compileShader(type: number, source: string): WebGLShader {
      const shader = gl?.createShader(type);
      if (!shader) throw new Error('Failed to create shader');
      gl?.shaderSource(shader, source);
      gl?.compileShader(shader);
      if (!gl?.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl?.getShaderInfoLog(shader);
        gl?.deleteShader(shader);
        throw new Error(`Shader compile error: ${error}`);
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) throw new Error('Failed to create shader program');
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(shaderProgram) ?? 'Unknown program link error');
    }
    gl.useProgram(shaderProgram);

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);

    function drawScene(): void {
      gl?.clear(gl.COLOR_BUFFER_BIT);

      // Draw spline
      const points = spline.sample();
      gl?.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl?.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl?.drawArrays(gl.LINE_STRIP, 0, points.length);

      // Draw control points
      gl?.bindBuffer(gl.ARRAY_BUFFER, controlPointsBuffer);
      gl?.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl?.drawArrays(gl.POINTS, 0, controlPoints.length);
      gl?.drawArrays(gl.LINE_STRIP, 0, controlPoints.length);
    }

    updateBuffers();
    drawScene();

    // --- Dragging Logic ---

    let isDragging = false;
    let draggingIndex: number | null = null;

    function getClipSpaceCoords(event: MouseEvent): Point {
      if (!canvas) return [0, 0];
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / canvas.height) * 2 - 1);
      return [x, y];
    }

    function getNearestControlPoint(pos: Point, threshold = 0.05): number | null {
      for (let i = 0; i < controlPoints.length; i++) {
        const [px, py] = controlPoints[i];
        const dx = pos[0] - px;
        const dy = pos[1] - py;
        if (dx * dx + dy * dy < threshold * threshold) return i;
      }
      return null;
    }

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getClipSpaceCoords(e);
      const idx = getNearestControlPoint(pos);
      if (idx !== null) {
        draggingIndex = idx;
        isDragging = true;
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || draggingIndex === null) return;
      const pos = getClipSpaceCoords(e);
      controlPoints[draggingIndex] = pos;
      spline.setControlPoints(controlPoints);
      updateBuffers();
      drawScene();
    };

    const stopDragging = () => {
      isDragging = false;
      draggingIndex = null;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', stopDragging);
      canvas.removeEventListener('mouseleave', stopDragging);
    };
  }, []);

  return (
    <div>
      <h1>Basis Spline Editor</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: '1px solid black', cursor: 'default' }}
      />
    </div>
  );
}

