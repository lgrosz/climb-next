import { BasisSpline } from "../BasisSpline"
import { Selection } from "./Select"

export interface NewGeometryEvent {
  type: "newgeometry"
  geometry: BasisSpline
}

export interface DataEvent {
  type: "data"
  data: [number, number][]
}

export interface SelectionEvent {
  type: "selection",
  selection: Selection | null,
}

export interface EventMap {
  "newgeometry": NewGeometryEvent
  "data": DataEvent
  "selection": SelectionEvent
}
