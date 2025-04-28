import { DataEvent, SelectionEvent, Tool, Selection, TransformEvent } from "@/lib/tools";
import { useEffect, useState } from "react";

export default function useTool(tool?: Tool | null) {
  const [data, setData] = useState<[number, number][]>();
  const [selection, setSelection] = useState<Selection | null>(null)
  const [transform, setTransform] = useState<[number, number] | null>(null);

  useEffect(() => {
    const handle = (data: DataEvent) => setData(data.data)
    const selection = (e: SelectionEvent) => setSelection(e.selection);
    const transform = (e: TransformEvent) => setTransform(e.transform);

    tool?.subscribe("data", handle);
    tool?.subscribe("selection", selection);
    tool?.subscribe("transform", transform);

    setData([]);
    setSelection(null);
    setTransform(null);

    return (() => {
      tool?.unsubscribe("data", handle);
      tool?.unsubscribe("selection", selection);
      tool?.unsubscribe("transform", transform);
    });
  }, [tool]);

  return { data, selection, transform };
}
