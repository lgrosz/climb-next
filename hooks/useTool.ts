import { CreateSplineTool, DataEvent } from "@/lib/tools";
import { useEffect, useState } from "react";

export default function useTool(tool?: CreateSplineTool | null) {
  const [data, setData] = useState<[number, number][]>();

  useEffect(() => {
    const handle = (data: DataEvent) => setData(data.data)
    tool?.subscribe("data", handle);

    setData([]);

    return (() => {
      tool?.unsubscribe("data", handle);
    });
  }, [tool]);

  return { data };
}
