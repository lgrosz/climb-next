import { useCallback, useEffect, useRef } from "react";
import { BasisSpline } from "@/lib/BasisSpline";
import { useTopoWorld } from "../context/TopoWorld";
import { SessionEvent, useTopoSession } from "../context/TopoSession";
import useTool from "@/hooks/useTool";

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
  box: function(ctx: CanvasRenderingContext2D, box: [[number, number], [number, number]]) {
    ctx.beginPath();
    ctx.rect(box[0][0], box[0][1], box[1][0] - box[0][0], box[1][1] - box[0][1]);
    ctx.stroke();
  },
}

const style = {
  frame: function(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 2;
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
      ghost: function(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
      },
    },
  },
}

export default function CanvasArea() {
  const { world } = useTopoWorld();
  const { tool, dispatch } = useTopoSession();
  const {
    data,
    selection,
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

    ctx.restore();
  }, [data, selection]);

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

    for (const climb of world.climbs) {
      for (const geom of climb.geometries ?? []) {
        ctx.save();
        style.geometry.spline.fixed(ctx);
        draw.spline(ctx, geom);
        ctx.restore();
      }
    }

    renderToolOverlay(ctx);

  }, [world.climbs, renderToolOverlay]);

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

