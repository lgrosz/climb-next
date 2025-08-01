import { describe, expect, test } from "@jest/globals";
import { __internal } from "./EditTopoClient";
import { TopoChange } from "@/hooks/useTopoHistory";

describe("Change reducer", () => {
  test("Multiple title actions", () => {
    const input: TopoChange[] = [
      {
        action: {
          type: "title",
          title: "The first title"
        }
      },
      {
        action: {
          type: "title",
          title: "The last title"
        }
      },
    ]

    expect(
      __internal.keepLatestTitle.apply(input)
    ).toStrictEqual(
      [input.at(-1)]
    );
  });
  test("assign-climb squahes into add", () => {
    const input: TopoChange[] = [
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "add",
            geometry: {
              points: [],
              degree: 0,
              knots: [],
            }
          }
        }
      },
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "assign-climb",
            id: "1"
          }
        }
      },
    ]

    const expected: TopoChange = {
      action: {
        type: "line",
        id: "xxx",
        action: {
          type: "add",
          climbId: "1",
          geometry: {
            points: [],
            degree: 0,
            knots: [],
          }
        }
      }
    };

    expect(
      __internal.squashClimbAssign.apply(input)
    ).toStrictEqual([expected]);
  });
  test("remove line removes other line changes", () => {
    const input: TopoChange[] = [
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "assign-climb",
            id: "1"
          }
        }
      },
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "remove",
          }
        }
      },
    ]

    expect(
      __internal.removeAllLineChangesForRemovedLine.apply(input)
    ).toStrictEqual([
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "remove",
          }
        }
      }
    ]);
  });
  test("completely remove line changes", () => {
    const input: TopoChange[] = [
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "add",
            geometry: {
              points: [],
              degree: 0,
              knots: [],
            }
          }
        }
      },
      {
        action: {
          type: "line",
          id: "xxx",
          action: {
            type: "remove",
          }
        }
      },
    ]

    expect(
      __internal.removeAllLineChangesForRemovedLine.apply(input)
    ).toStrictEqual([]);
  });
});
