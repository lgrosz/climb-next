import { SessionEvent } from "@/components/context/TopoSession";
import { BasisSpline } from "../BasisSpline";
import { Tool } from "./Tool";
import { BaseTool } from "./Base";

type SplineHandler = (spline: BasisSpline) => void;

export class CreateSplineTool extends BaseTool implements Tool {
  private onComplete?: SplineHandler
  private _points: [number, number][] = []

  constructor(handler?: SplineHandler) {
    super();
    this.onComplete = handler;
  }

  private set points(list: [number, number][]) {
    this._points = list;
    this.publish("data", { type: "data", data: list });
  }

  private get points() {
    return this._points;
  }

  handle(e: SessionEvent) {
    switch (e.type) {
      case "click":
        return this.click(e);
      case "dblclick":
        return this.doubleClick(e);
      case "contextmenu":
        return this.contextMenu(e);
      case "mousemove":
        return this.mouseMove(e);
      case "cancel":
        return this.cancel(e);
      default:
        return false;
    }
  }

  private click(e: SessionEvent) {
    if (e.type !== "click") return false;
    const newPoint: [number, number] = [e.x, e.y];
    const lastPoint = this.points[this.points.length - 1];

    if (!lastPoint || lastPoint[0] !== newPoint[0] || lastPoint[1] !== newPoint[1]) {
      this.points = [...this.points, newPoint];
      return true;
    }

    return false;
  }

  private contextMenu(e: SessionEvent) {
    if (e.type !== "contextmenu") return false;
    if (this.complete()) {
      this.points = [];
      return true;
    }

    return false;
  }

  private mouseMove(e: SessionEvent) {
    if (e.type !== "mousemove") return false;
    if (this.points.length) {
      this.publish("data", { type: "data", data: [...this.points, [e.x, e.y]] });
      return true;
    }

    return false;
  }

  private doubleClick(e: SessionEvent) {
    if (e.type !== "dblclick") return false;
    if (this.complete()) {
      this.points = [];
      return true;
    }

    return false;
  }

  private cancel(e: SessionEvent) {
    if (e.type !== "cancel") return false;
    if (this.points.length) {
      this.points = [];
      return true;
    }

    return false;
  }

  private complete() {
    if (this.points.length > 1) {
      const spline = new BasisSpline(this.points, this.points.length > 2 ? 2 : 1);
      this.publish("newgeometry", {
        type: "newgeometry",
        geometry: spline,
      });

      this.onComplete?.(spline)

      return true;
    }

    return false;
  }
}
