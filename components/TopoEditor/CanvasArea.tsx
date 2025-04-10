import { useEffect, useRef } from "react";
import { useTopoEditor } from "../context/TopoEditorContext";

export default function CanvasArea() {
  const { splines } = useTopoEditor();
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    // Basic vertex and fragment shaders
    const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      // Convert from 0-1 space to clip space (-1 to +1)
      gl_Position = vec4(a_position * 2.0 - 1.0, 0, 1);
    }
    `;

    const fragmentShaderSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(0.2, 0.7, 0.9, 1); // cyan color
    }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Render each spline
    for (const spline of splines) {
      const samples = spline.sample();
      const positions = new Float32Array(samples.flat());

      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.LINE_STRIP, 0, samples.length);
    }

    gl.flush();
  }, [splines]);

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <canvas
        ref={ref}
        className="w-full h-full block"
      />
    </div>
  );
}

