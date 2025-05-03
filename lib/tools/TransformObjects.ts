import { SessionEvent } from "@/components/context/TopoSession";
import { SelectionCallback, SelectionTool } from "./Select";
import { Tool } from "./Tool";

type Point = [number, number]

type HitTest = (point: Point) => boolean;
type TransformCallback = (point: Point) => void;

/**
 * A transformation intent tool
 *
 * This class will callback the supplied function with details of an "intended
 * transform." It must be provided with the hit-logic to facilitate what will
 * be done. This extends @see SelectionTool as it shares much of the same
 * selection logic when a hit does not occur.
 */
export class TransformObjects extends SelectionTool implements Tool {
  private hitTest: HitTest;
  private transform: TransformCallback;
  private origin: Point | null;
  private canceled: boolean;
  private dragged: boolean;

  constructor(hitTest: HitTest, selectionCallback: SelectionCallback, transform: TransformCallback) {
    super(selectionCallback);

    this.hitTest = hitTest;
    this.transform = transform;
    this.origin = null;
    this.canceled = false;
    this.dragged = false;
  }

  override handle(e: SessionEvent): boolean {
    switch (e.type) {
      case "mousedown":
        this.dragged = false;

        if (this.hitTest([e.x, e.y])) {
          this.origin = [e.x, e.y];
          return true;
        }

        this.origin = null;
        return super.handle(e);

      case "mousemove":
        if (this.origin) {
          this.publish("transform", { type: "transform", transform: [e.x - this.origin[0], e.y - this.origin[1]] });
          this.dragged = true;
          return true;
        }

        return super.handle(e);

      case "mouseup":
        if (this.origin && this.dragged) {
          this.transform([e.x - this.origin[0], e.y - this.origin[1]]);
          this.publish("transform", { type: "transform", transform: null });
          this.origin = null;
          return true;
        }

        if (this.canceled) {
          this.canceled = false;
          return true;
        }

        return super.handle(e);

      case "cancel":
        if (this.origin) {
          this.publish("transform", { type: "transform", transform: null });
          this.origin = null;
          this.canceled = true;
          return true;
        }

        return super.handle(e);

      case "click":
        if (this.dragged) return true;
        return super.handle(e);

      default:
        return super.handle(e);
    }
  }
}
