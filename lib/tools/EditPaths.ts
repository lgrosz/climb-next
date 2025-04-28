import { Tool } from "./Tool";
import { TransformObjects } from "./TransformObjects";

/**
 * A path edit intent tool
 *
 * While the transform tool is _just_ a "move" tool (and not a rotate/scale
 * tool), then this tool is the same but with different handler functions.
 */
export class EditPaths extends TransformObjects implements Tool { }

