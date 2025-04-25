import { SessionEvent } from "@/components/context/TopoSession";
import { EventMap } from "./Event";
import { Tool } from "./Tool";

type Listener<T> = (event: T) => void;

export class BaseTool implements Tool {
  private listeners: {
    [K in keyof EventMap]?: Set<Listener<EventMap[K]>>
  } = { };

  handle(_: SessionEvent) {
    return false;
  }

  subscribe<K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) {
    if (!this.listeners[type]) {
      // the compiler cannot see that this is okay, so assert
      this.listeners[type] = new Set as never;
    }

    this.listeners[type].add(handler);
  }

  unsubscribe<K extends keyof EventMap>(type: K, handler: Listener<EventMap[K]>) {
    this.listeners[type]?.delete(handler);
  }

  protected publish<K extends keyof EventMap>(type: K, event: EventMap[K]) {
    this.listeners[type]?.forEach(fn => fn(event));
  }
}
