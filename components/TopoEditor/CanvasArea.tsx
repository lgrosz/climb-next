import { useCallback, useEffect, useRef } from "react";
import { BasisSpline } from "@/lib/BasisSpline";
import { useTopoWorld } from "../context/TopoWorld";
import { SessionEvent, useTopoSession } from "../context/TopoSession";
import useTool from "@/hooks/useTool";
import { EditPaths, TransformObjects } from "@/lib/tools";

const draw = {
  spline: function(ctx: CanvasRenderingContext2D, spline: BasisSpline) {
    let points;

    if (spline.degree === 1) {
      // Use control points directly for linear splines
      points = spline.control;
    } else {
      // Sample for higher-degree splines
      points = spline.sample();
    }

    draw.line(ctx, points);
  },
  line: function(ctx: CanvasRenderingContext2D, line: [number, number][]) {
    if (line.length < 1) return;

    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (const [x, y] of line.slice(1)) {
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  },
  node: function(ctx: CanvasRenderingContext2D, point: [number, number]) {
    const [x, y] = point;
    const size = 5;

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  },
  box: function(ctx: CanvasRenderingContext2D, box: [[number, number], [number, number]]) {
    ctx.beginPath();
    ctx.rect(box[0][0], box[0][1], box[1][0] - box[0][0], box[1][1] - box[0][1]);
    ctx.stroke();
  },
}

const style = {
  diamond: function(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#d1d5db";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
  },
  frame: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 2;
  },
  sketch: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
  },
  ghost: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(0, 0, 0, 0)";
  },
  geometry: {
    spline: {
      fixed: function(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      },
    },
  },
}

export default function CanvasArea() {
  const { world } = useTopoWorld();
  const { tool, dispatch, selection: sessionSelection } = useTopoSession();
  const {
    data,
    selection,
    transform,
  } = useTool(tool);

  const ref = useRef<HTMLCanvasElement | null>(null);

  // Make canvas focusable
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    canvas.tabIndex = 0;

    const focus = () => canvas.focus();

    canvas.addEventListener("mousedown", focus);

    return () => {
      canvas.removeEventListener("mousedown", focus);
    }
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;

      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [ref]);

  const renderToolOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();

    if (data) {
      // TODO translate date from-world to context
      style.frame(ctx);
      draw.line(ctx, data);

      if (data.length > 2) {
        draw.spline(ctx, new BasisSpline(data, 2));
      }
    }

    if (selection && selection.type == "box") {
      style.frame(ctx);
      draw.box(ctx, selection.data);
    }

    if (tool instanceof EditPaths) {
      for (const [index, cs] of Object.entries(sessionSelection.lines)) {
        const geom = world.lines.at(Number(index))?.geometry;
        if (!geom) continue;

        ctx.save();
        style.frame(ctx);
        draw.line(ctx, geom.control);
        ctx.restore();

        for (const [index, point] of geom.control.entries()) {
          const selected = cs.geometry.nodes?.some(n => n.index === index);

          ctx.save();
          style.diamond(ctx);
          if (selected) ctx.fillStyle = "#0000ff";
          draw.node(ctx, point);
          ctx.restore();
        }
      }
    }

    if (transform) {
      // TODO if `TransformObjects` selected all nodes, the logic here could be identical
      if (tool instanceof EditPaths) {
        for (const [index, line] of world.lines.entries()) {
          const sClimb = sessionSelection.lines[index];
          if (!sClimb) continue;

          const geom = line.geometry;
          const control: [number, number][] = geom.control.map((c, i) => {
            const selected = sClimb.geometry.nodes?.some((n => n.index === i));

            if (selected) {
              return [c[0] + transform[0], c[1] + transform[1]]
            } else {
              return c;
            }
          });

          const transformedGeom = new BasisSpline(control, geom.degree, geom.knots);

          style.ghost(ctx);
          draw.spline(ctx, transformedGeom);
          draw.line(ctx, transformedGeom.control);
        }
      } else if (tool instanceof TransformObjects) {
        for (const [index, line] of world.lines.entries()) {
          const sClimb = sessionSelection.lines[index];
          if (!sClimb) continue;

          const geom = line.geometry;
          const control: [number, number][] = geom.control.map(c => [c[0] + transform[0], c[1] + transform[1]]);
          const transformedGeom = new BasisSpline(control, geom.degree, geom.knots);

          style.ghost(ctx);
          draw.spline(ctx, transformedGeom);
        }
      }
    }

    ctx.restore();
  }, [data, selection, sessionSelection, transform, world.lines, tool]);

  // Render method
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      alert("Unable to initialize render context. Your browser or machine may not support it.");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw bounding boxes for the selected items
    for (const [index] of Object.entries(sessionSelection.lines)) {
      const line = world.lines.at(Number(index));
      if (!line) continue;

      const geom = line.geometry;
      const box = geom.bounds();

      ctx.save();
      style.sketch(ctx);
      draw.box(ctx, box);
      ctx.restore();
    }

    for (const line of world.lines) {
      ctx.save();
      style.geometry.spline.fixed(ctx);
      draw.spline(ctx, line.geometry);
      ctx.restore();
    }

    renderToolOverlay(ctx);

  }, [world.lines, sessionSelection.lines, renderToolOverlay]);

  const toSession = useCallback((e: MouseEvent | KeyboardEvent): SessionEvent | null => {
    // TODO I can see this blowing up
    if (e instanceof MouseEvent) {
      const validTypes: SessionEvent["type"][] = ["click", "dblclick", "contextmenu", "mousedown", "mousemove", "mouseup"];

      if (!validTypes.includes(e.type as SessionEvent["type"])) {
        return null;
      }

      return {
        type: e.type as SessionEvent["type"],
        x: e.offsetX,
        y: e.offsetY,
        shiftKey: e.shiftKey,
      };
    } else if (e instanceof KeyboardEvent) {
      if (e.key === "Escape") {
        return {
          type: "cancel",
        }
      }
    }

    return null;
  }, []);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;

    const handle = (e: MouseEvent | KeyboardEvent) => {
      const worldEvent = toSession(e);
      if (!worldEvent) return;

      if (dispatch(worldEvent)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    canvas.addEventListener("click", handle);
    canvas.addEventListener("dblclick", handle);
    canvas.addEventListener("contextmenu", handle);
    canvas.addEventListener("mousedown", handle);
    canvas.addEventListener("mousemove", handle);
    canvas.addEventListener("mouseup", handle);
    canvas.addEventListener("keydown", handle);

    return () => {
      canvas.removeEventListener("click", handle);
      canvas.removeEventListener("dblclick", handle);
      canvas.removeEventListener("contextmenu", handle);
      canvas.removeEventListener("mousedown", handle);
      canvas.removeEventListener("mousemove", handle);
      canvas.removeEventListener("mouseup", handle);
      canvas.removeEventListener("keydown", handle);
    };
  }, [toSession, dispatch]);

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <canvas
        ref={ref}
        className="w-full h-full block"
      />
    </div>
  );
}

