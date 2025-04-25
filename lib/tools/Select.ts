import { SessionEvent } from "@/components/context/TopoSession";
import { Tool } from "./Tool";
import { BaseTool } from "./Base";

type Point = [number, number];
type Box = [[number, number], [number, number]];

type PointSelection = { type: "point", data: Point };
type BoxSelection = { type: "box", data: Box };

export type Selection = PointSelection | BoxSelection;

type SelectionCallback = (selection: Selection) => void;

export class SelectionTool extends BaseTool implements Tool {
  private _start: Point | null = null;
  private _current: Point | null = null;
  private cancelled = false;
  private callback?: SelectionCallback;

  private get start() {
    return this._start;
  }

  private get current() {
    return this._current;
  }

  private set start(point: Point | null) {
    this._start = point;

    if (!point) {
      this.publish("selection", {
        type: "selection",
        selection: null,
      });
    }
  }

  private set current(point: Point | null) {
    this._current = point;

    if (point && this.start) {
      this.publish("selection", {
        type: "selection",
        selection: {
          type: "box",
          data: [this.start, point]
        },
      });
    }
  }

  constructor(callback?: SelectionCallback) {
    super();
    this.callback = callback;
  }

  handle(e: SessionEvent): boolean {
    switch (e.type) {
      case "mousedown":
        return this.mouseDown(e);
      case "mousemove":
        return this.mouseMove(e);
      case "mouseup":
        return this.mouseUp(e);
      case "click":
        return this.click(e);
      case "cancel":
        return this.cancel(e);
      default:
        return false;
    }
  }

  private mouseDown(e: SessionEvent): boolean {
    if (e.type !== "mousedown") return false;
    this.start = [e.x, e.y];
    this.current = null;
    this.cancelled = false;
    return true;
  }

  private mouseMove(e: SessionEvent): boolean {
    if (e.type !== "mousemove") return false;
    if (!this.start) return false;
    this.current = [e.x, e.y];
    return true;
  }

  private mouseUp(e: SessionEvent): boolean {
    if (e.type !== "mouseup") return false;
    if (!this.start || !this.current) return false;
    this.callback?.({ type: "box", data: [this.start, this.current] });
    this.start = null;
    return true;
  }

  private click(e: SessionEvent): boolean {
    if (e.type !== "click") return false;

    // was dragging, still consume the event
    if (this.current || this.cancelled) return true;

    const data: Point = [e.x, e.y];
    this.callback?.({ type: "point", data });
    this.start = null;

    return true;
  }

  private cancel(e: SessionEvent): boolean {
    if (e.type !== "cancel") return false;

    if (this.start) {
      this.start = null;
      this.current = null;
      this.cancelled = true;
      return true;
    }

    return false;
  }
}
