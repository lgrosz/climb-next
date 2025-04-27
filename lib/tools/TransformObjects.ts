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

  constructor(hitTest: HitTest, selectionCallback: SelectionCallback, transform: TransformCallback) {
    super(selectionCallback);

    this.hitTest = hitTest;
    this.transform = transform;
    this.origin = null;
  }

  override handle(e: SessionEvent): boolean {
    switch (e.type) {
      case "mousedown":
        if (this.hitTest([e.x, e.y])) {
          this.origin = [e.x, e.y];
          return true;
        }

        this.origin = null;
        return super.handle(e);

      case "mousemove":
        if (this.origin) {
          // TODO publish transform and return early
          return true;
        }

        return super.handle(e);

      case "mouseup":
        if (this.origin) {
          this.transform([e.x - this.origin[0], e.y - this.origin[1]]);
          return true;
        }

        return super.handle(e);

      // TODO if dragging, do I stop all other event propagation?

      default:
        return super.handle(e);
    }
  }
}
