import { BasisSpline } from "../BasisSpline"

export interface NewGeometryEvent {
  type: "newgeometry"
  geometry: BasisSpline
}

export interface DataEvent {
  type: "data"
  data: [number, number][]
}

export interface EventMap {
  "newgeometry": NewGeometryEvent
  "data": DataEvent
}
