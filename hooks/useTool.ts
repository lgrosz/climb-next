import { DataEvent, SelectionEvent, Tool, Selection } from "@/lib/tools";
import { useEffect, useState } from "react";

export default function useTool(tool?: Tool | null) {
  const [data, setData] = useState<[number, number][]>();
  const [selection, setSelection] = useState<Selection | null>(null)

  useEffect(() => {
    const handle = (data: DataEvent) => setData(data.data)
    const selection = (e: SelectionEvent) => setSelection(e.selection);

    tool?.subscribe("data", handle);
    tool?.subscribe("selection", selection);

    setData([]);
    setSelection(null);

    return (() => {
      tool?.unsubscribe("data", handle);
      tool?.unsubscribe("selection", selection);
    });
  }, [tool]);

  return { data, selection };
}
