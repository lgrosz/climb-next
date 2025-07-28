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
});
