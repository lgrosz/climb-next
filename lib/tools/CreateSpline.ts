import { SessionEvent } from "@/components/context/TopoSession";
import { BasisSpline } from "../BasisSpline";

export interface NewGeometryEvent {
  type: "newgeometry"
  geometry: BasisSpline
}

export interface DataEvent {
  type: "data"
  data: [number, number][]
}

interface EventMap {
  "newgeometry": NewGeometryEvent
  "data": DataEvent
}

type Listener<T> = (event: T) => void;

export class CreateSplineTool {
  private _points: [number, number][] = []
  private listeners: {
    [K in keyof EventMap]?: Set<Listener<EventMap[K]>>
  } = {};

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
      default:
        return false;
    }
  }

  private click(e: SessionEvent) {
    const newPoint: [number, number] = [e.x, e.y];
    const lastPoint = this.points[this.points.length - 1];

    if (!lastPoint || lastPoint[0] !== newPoint[0] || lastPoint[1] !== newPoint[1]) {
      this.points = [...this.points, newPoint];
      return true;
    }

    return false;
  }

  private contextMenu(_: SessionEvent) {
    if (this.complete()) {
      this.points = [];
      return true;
    }

    return false;
  }

  private mouseMove(e: SessionEvent) {
    if (this.points.length) {
      this.publish("data", { type: "data", data: [...this.points, [e.x, e.y]] });
      return true;
    }

    return false;
  }

  private doubleClick(_: SessionEvent) {
    if (this.complete()) {
      this.points = [];
      return true;
    }

    return false;
  }

  subscribe<K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) {
    if (!this.listeners[type]) {
      // the compiler cannot see that this is okay, so assert
      this.listeners[type] = new Set as never;
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
