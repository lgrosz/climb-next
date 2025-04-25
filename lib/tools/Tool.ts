import { SessionEvent } from "@/components/context/TopoSession";
import { EventMap } from "./Event";

type Listener<T> = (event: T) => void;

export interface Tool {
  subscribe: <K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) => void;
  unsubscribe: <K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) => void;
  handle: (e: SessionEvent) => boolean;
}
