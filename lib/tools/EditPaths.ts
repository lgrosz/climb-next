import { SessionEvent } from "@/components/context/TopoSession";
import { Tool } from "./Tool";
import { TransformCallback, TransformObjects } from "./TransformObjects";
import { SelectionCallback } from "./Select";

type Point = [number, number]

type HitTest = (point: Point) => boolean;

export type AddNodeCallback = (_: Point) => boolean;

/**
 * A path edit intent tool
 *
 * While the transform tool is _just_ a "move" tool (and not a rotate/scale
 * tool), then this tool is the same but with different handler functions.
 */
export class EditPaths extends TransformObjects implements Tool {
  private addNode: TransformCallback;

  constructor(hitTest: HitTest, selectionCallback: SelectionCallback, transform: TransformCallback, addNode: AddNodeCallback) {
    super(hitTest, selectionCallback, transform);
    this.addNode = addNode;
  }

  override handle(e: SessionEvent): boolean {
    switch (e.type) {
      case "dblclick":
        const point: Point = [e.x, e.y];
        this.addNode(point);
        this.publish("edit-path", { type: "add-node", point });

        return true;
      default:
        return super.handle(e);
    }
  }
}

