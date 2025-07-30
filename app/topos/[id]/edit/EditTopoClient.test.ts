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
      input.reduce(__internal.changeReducer, [])
    ).toStrictEqual(
      [input.at(-1)]
    );
  });
  test("assign-climb squahes into add-line", () => {
    const input: TopoChange[] = [
      {
        action: {
          type: "add-line",
          line: {
            featureId: "xxx",
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
        type: "add-line",
        line: {
          featureId: "xxx",
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
      input.reduce(__internal.changeReducer, [])
    ).toStrictEqual([expected]);
  });
});
