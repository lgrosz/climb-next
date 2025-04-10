import { useEffect, useRef, useState } from "react";
import { SplineReducerActionType, useTopoEditor } from "../context/TopoEditorContext";

export default function CanvasArea() {
  const { splines, activeSplineIndex, setActiveSplineIndex, setSplines } = useTopoEditor();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const dragOffset = useRef<[number, number] | null>(null);
  const [draggedControlPointIndex, setDraggedControlPointIndex] = useState<number | null>(null);

  function normalizeClientPoint(client: [number, number]): [number, number] | null {
    const canvas = ref.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const px = client[0] - rect.left;
    const py = client[1] - rect.top;

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // Normalize click coordinates to [0,1]
    const normX = px / canvasWidth;
    const normY = py / canvasHeight;
    return [normX, 1 - normY];
  }

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

    for (const [index, spline] of splines.entries()) {
      const isActive = index === activeSplineIndex;

      drawPoints(spline.sample(), isActive ? [0, 0.6, 0, 1] : [0.2, 0.7, 0.9, 1.0], gl.LINE_STRIP);
      drawPoints(spline.control, [0.5, 0.5, 0.5, 1.0], gl.LINE_STRIP);
      drawPoints(spline.control, [1.0, 0.0, 0.0, 1.0], gl.POINTS);
    }

    gl.flush();
  }, [splines, activeSplineIndex]);

  // Handle mouse down, move, and up for dragging control points
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // facilitates selection of a spline
    function handleClick(e: MouseEvent) {
      if (!canvas) return;

      const clickNorm = normalizeClientPoint([e.clientX, e.clientY]);
      if (!clickNorm) return;

      // TODO There is unexpected behavior when "dragging," for example
      // - when you "drag onto" the line and release, it will still select it, it shouldn't
      // - when you move a control point, the line is always unselected

      let selectedSplineIndex: number | null = null;

      for (const [index, spline] of splines.entries()) {
        if (spline.isPointOnSpline(clickNorm, 0.006)) {
          selectedSplineIndex = index;
          break;
        }
      }

      setActiveSplineIndex(selectedSplineIndex);
    }

    // selects control points
    function handleMouseDown(e: MouseEvent) {
      if (!canvas) return;

      if (activeSplineIndex === null) return;

      const clickNorm = normalizeClientPoint([e.clientX, e.clientY]);
      if (!clickNorm) return;

      const activeSpline = splines[activeSplineIndex];

      let activeControlPointIndex: number | null = null;

      for (const [index, point] of activeSpline.control.entries()) {
        const dx = point[0] - clickNorm[0];
        const dy = point[1] - clickNorm[1];
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.006) {
          activeControlPointIndex = index;
          break;
        }
      }

      dragOffset.current = activeControlPointIndex === null ? null : [
          clickNorm[0] - activeSpline.control[activeControlPointIndex][0],
          clickNorm[1] - activeSpline.control[activeControlPointIndex][1],
      ];

      setDraggedControlPointIndex(activeControlPointIndex);
    }

    // drag the active control point
    function handleMouseMove(e: MouseEvent) {
      if (!canvas || !dragOffset.current || draggedControlPointIndex === null || activeSplineIndex === null) return;

      let updatedControlPoint = normalizeClientPoint([e.clientX, e.clientY]);
      if (!updatedControlPoint) return;
      updatedControlPoint = [ // keeps the point relative to where it was clicked
        updatedControlPoint[0] + dragOffset.current[0],
        updatedControlPoint[1] + dragOffset.current[1]
      ];

      const activeSpline = splines[activeSplineIndex];
      const updatedControlPoints = [...activeSpline.control];
      updatedControlPoints[draggedControlPointIndex] = updatedControlPoint;

      // Create a new spline with the updated control points
      const updatedSpline = activeSpline.withControlPoints(updatedControlPoints);

      setSplines({
        type: SplineReducerActionType.Update,
        index: activeSplineIndex,
        spline: updatedSpline,
      });
    }

    function handleMouseUp() {
      dragOffset.current = null;
      setDraggedControlPointIndex(null); // Reset the dragged control point index
    }

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [splines, activeSplineIndex, draggedControlPointIndex, setSplines, setActiveSplineIndex]);

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <canvas
        ref={ref}
        className="w-full h-full block"
      />
    </div>
  );
}

