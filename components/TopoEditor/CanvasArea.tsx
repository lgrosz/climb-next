import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
      points = spline.points;
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
    const size = 8;

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
    ctx.lineWidth = 3;
  },
  frame: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 3;
  },
  sketch: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 15]);
  },
  ghost: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 6;
    ctx.shadowColor = "rgba(0, 0, 0, 0)";
  },
  geometry: {
    spline: {
      fixed: function(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 12;
      },
    },
  },
}

export default function CanvasArea() {
  const world = useTopoWorld();
  const { tool, dispatch, selection: sessionSelection } = useTopoSession();
  const {
    data,
    selection,
    transform,
  } = useTool(tool);

  const images = useMemo(() => {
    if (typeof window === "undefined") return new Map<string, HTMLImageElement>;

    const map = new Map<string, HTMLImageElement>;

    for (const image of world.images) {
      const id = image.id;
      const el = new Image;
      el.src = `/images/${id}/download`;

      if (image.alt) {
        el.alt = image.alt;
      }

      map.set(id, el);
    }

    return map;
  }, [world.images]); // NOTE world.images must not be mutated

  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(1);

  const ref = useRef<HTMLCanvasElement | null>(null);

  // Renders tool related stuff, this is getting a bit ugly and seems like it'll
  // continue as more tools are introduced
  const renderToolOverlay = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const toScreen = ([x, y]: [number, number]): [number, number] => [
      x * zoom + pan[0],
      y * zoom + pan[1],
    ];

    ctx.save();

    if (data) {
      style.frame(ctx);
      draw.line(ctx, data.map(toScreen));

      if (data.length > 2) {
        draw.spline(ctx, new BasisSpline(data.map(toScreen), 2));
      }
    }

    if (selection?.type == "box") {
      style.frame(ctx);
      draw.box(ctx, [toScreen(selection.data[0]), toScreen(selection.data[1])]);
    }

    if (tool instanceof EditPaths) {
      for (const [index, cs] of Object.entries(sessionSelection.lines)) {
        const geom = world.lines.at(Number(index))?.geometry;
        if (!geom) continue;

        style.frame(ctx);
        draw.line(ctx, geom.points.map(toScreen));

        for (const [i, point] of geom.points.entries()) {
          const selected = cs.geometry.nodes?.some(n => n.index === i);
          style.diamond(ctx);
          if (selected) ctx.fillStyle = "#0000ff";
          draw.node(ctx, toScreen(point));
        }
      }
    }

    if (transform) {
      ctx.save();
      style.ghost(ctx);

      // TODO if `TransformObjects` selected all nodes, the logic here could be identical
      if (tool instanceof EditPaths) {
        for (const [index, line] of world.lines.entries()) {
          const sClimb = sessionSelection.lines[index];
          if (!sClimb) continue;

          const geom = line.geometry;

          const points: [number, number][] = geom.points.map((p, i) => {
            const selected = sClimb.geometry.nodes?.some(n => n.index === i);
            const world: [number, number] = selected
              ? [p[0] + transform[0], p[1] + transform[1]]
              : p;
            return toScreen(world);
          });

          const transformedGeom = new BasisSpline(
            points,
            geom.degree,
            geom.knots
          );

          draw.spline(ctx, transformedGeom);
          draw.line(ctx, points);
        }
      } else if (tool instanceof TransformObjects) {
        for (const [index, line] of world.lines.entries()) {
          const sClimb = sessionSelection.lines[index];
          if (!sClimb) continue;

          const geom = line.geometry;

          const points: [number, number][] = geom.points.map(p =>
            toScreen([p[0] + transform[0], p[1] + transform[1]])
          );

          const transformedGeom = new BasisSpline(
            points,
            geom.degree,
            geom.knots
          );

          draw.spline(ctx, transformedGeom);
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }, [data, selection, sessionSelection, transform, world.lines, tool, pan, zoom]);

  // Render method
  const redraw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.save();

    // draw "desk"
    ctx.fillStyle = "#ccc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // zoom to paper
    ctx.translate(...pan);
    ctx.scale(zoom, zoom);

    // "draw paper"
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, world.size.width, world.size.height);
    ctx.restore();

    for (const image of world.images) {
      const el = images.get(image.id);

      if (el) {
        const dx = image.dest.min.x;
        const dy = image.dest.min.y;
        const dWidth = image.dest.max.x - dx;
        const dHeight = image.dest.max.y - dy;

        if (image.source && el.naturalWidth) {
          const sx = image.dest.min.x * el.naturalWidth;
          const sy = image.dest.min.y * el.naturalHeight;
          const sWidth = image.source.max.x * el.naturalWidth - sx;
          const sHeight = image.source.max.y * el.naturalHeight - sy;

          ctx.drawImage(el, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        } else {
          ctx.drawImage(el, dx, dy, dWidth, dHeight);
        }
      }
    }

    // draw bounding boxes for the selected items
    // TODO these should be fixed sizes
    for (const [index] of Object.entries(sessionSelection.lines)) {
      const line = world.lines.at(Number(index));
      if (!line) continue;

      const geom = new BasisSpline(line.geometry.points, line.geometry.degree, line.geometry.knots);
      const box = geom.bounds();

      ctx.save();
      style.sketch(ctx);
      draw.box(ctx, box);
      ctx.restore();
    }

    for (const line of world.lines) {
      ctx.save();
      style.geometry.spline.fixed(ctx);
      const spline = new BasisSpline(line.geometry.points, line.geometry.degree, line.geometry.knots);
      draw.spline(ctx, spline);
      ctx.restore();
    }

    // zoom out from paper
    ctx.restore();

    renderToolOverlay();
  }, [world.lines, world.images, sessionSelection.lines, renderToolOverlay, world.size, pan, zoom, images]);

  // redraw when images load
  useEffect(() => {
    const listener = () => { redraw(); };
    const cleanupFns: (() => void)[] = [];

    for (const image of images.values()) {
      image.addEventListener("load", listener);
      cleanupFns.push(() => image.removeEventListener("load", listener));
    }

    return () => {
      for (const cleanup of cleanupFns) {
        cleanup();
      }
    };
  }, [images, redraw]);

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

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (!canvas) return;

      const { deltaX, deltaY, ctrlKey } = e;

      if (ctrlKey) {
        const zoomFactor = 1.05;
        const scaleDelta = deltaY < 0 ? zoomFactor : 1 / zoomFactor;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - pan[0]) / zoom;
        const worldY = (mouseY - pan[1]) / zoom;

        const newScale = zoom * scaleDelta;

        setZoom(newScale);
        setPan([
          mouseX - worldX * newScale,
          mouseY - worldY * newScale,
        ]);
      } else {
        setPan(prev => [
          prev[0] - deltaX,
          prev[1] - deltaY,
        ]);
      }

      requestAnimationFrame(() => redraw());
    }

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [pan, redraw, zoom]);

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
        redraw();
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [ref, redraw]);

  // Redraw as the redraw method changes (world/session changes, etc)
  useEffect(() => {
    requestAnimationFrame(() => redraw());
  }, [redraw]);

  const toSession = useCallback((e: MouseEvent | KeyboardEvent): SessionEvent | null => {
    // TODO I can see this blowing up
    if (e instanceof MouseEvent) {
      const validTypes: SessionEvent["type"][] = ["click", "dblclick", "contextmenu", "mousedown", "mousemove", "mouseup"];

      if (!validTypes.includes(e.type as SessionEvent["type"])) {
        return null;
      }

      const canvas = ref.current;
      if (!canvas) return null;

      return {
        type: e.type as SessionEvent["type"],
        x: (e.offsetX - pan[0]) / zoom,
        y: (e.offsetY - pan[1]) / zoom,
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
  }, [pan, zoom]);

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

