import { useCallback, useEffect, useRef } from "react";
import { BasisSpline } from "@/lib/BasisSpline";
import { useTopoWorld } from "../context/TopoWorld";
import { useTopoSession } from "../context/TopoSession";
import { WorldEvent } from "@/lib/tools";
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
  }
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
  const { tool } = useTopoSession();
  const { data } = useTool(tool);

  const ref = useRef<HTMLCanvasElement | null>(null);

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

    ctx.restore();
  }, [data]);

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

  const toWorld = useCallback((e: MouseEvent): WorldEvent | null => {
    const validTypes: WorldEvent["type"][] = ["click", "dblclick", "contextmenu"];

    if (!validTypes.includes(e.type as WorldEvent["type"])) {
      return null;
    }

    return {
      type: e.type as WorldEvent["type"],
      x: e.offsetX,
      y: e.offsetY,
    };
  }, []);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;

    const handle = (e: MouseEvent) => {
      const worldEvent = toWorld(e);
      if (!worldEvent) return;

      const handled = tool?.handle?.(worldEvent);

      if (handled) {
        e.preventDefault();
      }
    };

    canvas.addEventListener("click", handle);
    canvas.addEventListener("dblclick", handle);
    canvas.addEventListener("contextmenu", handle);

    return () => {
      canvas.removeEventListener("click", handle);
      canvas.removeEventListener("dblclick", handle);
      canvas.removeEventListener("contextmenu", handle);
    };
  }, [tool, toWorld]);

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <canvas
        ref={ref}
        className="w-full h-full block"
      />
    </div>
  );
}

