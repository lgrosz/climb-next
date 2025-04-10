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

    gl.clearColor(1, 1, 1, 1); // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position * 2.0 - 1.0, 0, 1);
        gl_PointSize = 6.0;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
        gl_FragColor = u_color;
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
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    function drawPoints(points: [number, number][], color: [number, number, number, number], mode: GLenum) {
      const flat = new Float32Array(points.flat());
      const buffer = gl?.createBuffer()!;
      gl?.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl?.bufferData(gl.ARRAY_BUFFER, flat, gl.STATIC_DRAW);

      gl?.enableVertexAttribArray(positionAttributeLocation);
      gl?.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl?.uniform4fv(colorUniformLocation, color);
      gl?.drawArrays(mode, 0, points.length);
    }

    for (const spline of splines) {
      drawPoints(spline.sample(), [0.2, 0.7, 0.9, 1.0], gl.LINE_STRIP);  // spline: cyan
      drawPoints(spline.control, [0.5, 0.5, 0.5, 1.0], gl.LINE_STRIP);      // control polygon: gray
      drawPoints(spline.control, [1.0, 0.0, 0.0, 1.0], gl.POINTS);        // control points: red
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

