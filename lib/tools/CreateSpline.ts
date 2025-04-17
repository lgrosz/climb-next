import { BasisSpline } from "../BasisSpline";

export interface WorldEvent {
  type: "click" | "dblclick" | "contextmenu"
  x: number
  y: number
}

export class CreateSplineTool {
  private points: [number, number][] = []
  private listeners = new Set<(spline: BasisSpline) => void>;

  handle(e: WorldEvent) {
    switch (e.type) {
      case "click":
        return this.click(e);
      case "dblclick":
        return this.doubleClick(e);
      case "contextmenu":
        return this.contextMenu(e);
      default:
        return false;
    }
  }

  private click(e: WorldEvent) {
    const newPoint: [number, number] = [e.x, e.y];
    const lastPoint = this.points[this.points.length - 1];

    if (!lastPoint || lastPoint[0] !== newPoint[0] || lastPoint[1] !== newPoint[1]) {
      this.points = [...this.points, newPoint];
      return true;
    }

    return false;
  }

  private contextMenu(_: WorldEvent) {
    if (this.complete()) {
      this.points = [];
      return true;
    }

    return false;
  }

  private doubleClick(_: WorldEvent) {
    if (this.complete()) {
      this.points = [];
      return true;
    }

    return false;
  }

  subscribe(handler: (spline: BasisSpline) => void) {
    this.listeners.add(handler);
  }

  unsubscribe(handler: (spline: BasisSpline) => void) {
    this.listeners.delete(handler);
  }

  private complete() {
    if (this.points.length > 1) {
      this.publish(new BasisSpline(this.points, this.points.length > 2 ? 2 : 1));
      return true;
    }

    return false;
  }

  private publish(spline: BasisSpline) {
    this.listeners.forEach(fn => fn(spline));
  }
}
