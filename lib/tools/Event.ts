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

export interface TransformEvent {
  type: "transform";
  transform: [number, number] | null;
}

type EditPathEvent = AddNodeEditPathEvent;

type AddNodeEditPathEvent = {
  type: "add-node",
  point: [number, number]
}

export interface EventMap {
  "newgeometry": NewGeometryEvent
  "data": DataEvent
  "selection": SelectionEvent
  "transform": TransformEvent
  "edit-path": EditPathEvent
}
