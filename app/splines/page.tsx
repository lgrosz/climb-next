'use client';

import { useEffect, useRef } from 'react';
import { BasisSpline } from '@/lib/BasisSpline';
import vertexShaderSource from "./spline.vert.glsl";
import fragmentShaderSource from "./spline.frag.glsl";

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

    const spline = new BasisSpline(
      [
        [0.1, 0.7],
        [0.3, 0.9],
        [0.5, 0.5],
        [0.7, 0.9],
        [0.9, 0.6],
      ], 2
    );
    const points = spline.sample();
    const flatPoints = new Float32Array(points.flat());

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
    gl.drawArrays(gl.LINE_STRIP, 0, points.length);

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

