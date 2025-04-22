import { BasisSpline } from "../BasisSpline";

export interface NewGeometryEvent {
  type: "newgeometry"
  geometry: BasisSpline
}

interface EventMap {
  "newgeometry": NewGeometryEvent
}

export interface WorldEvent {
  type: "click" | "dblclick" | "contextmenu"
  x: number
  y: number
}

type Listener<T> = (event: T) => void;

export class CreateSplineTool {
  private _points: [number, number][] = []
  private listeners: {
    [K in keyof EventMap]?: Set<Listener<EventMap[K]>>
  } = {};

  private set points(list: [number, number][]) {
    this._points = list;
  }

  private get points() {
    return this._points;
  }

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

  subscribe<K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }

    this.listeners[type].add(handler);
  }

  unsubscribe<K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) {
    this.listeners[type]?.delete(handler);
  }

  private complete() {
    if (this.points.length > 1) {
      this.publish("newgeometry", {
        type: "newgeometry",
        geometry: new BasisSpline(this.points, this.points.length > 2 ? 2 : 1)
      });

      return true;
    }

    return false;
  }

  private publish<K extends keyof EventMap>(type: K, event: EventMap[K]) {
    this.listeners[type]?.forEach(fn => fn(event));
  }
}
