export type PointTuple = [x: number, y: number];

export interface BaseElement {
  id: string;
}

export interface PointElement extends BaseElement {
  type: "point";
  radius: number;
  x: number;
  y: number;
}

export interface ZoomElement extends BaseElement {
  type: "zoom";
  point: PointElement;
  size: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  fileId: string;
  width: number;
  height: number;
  bounds: PointElement;
}

export interface ShelfElement extends BaseElement {
  type: "shelf";
  color: string;
  points: PointElement[];
}

export type LabelMeElement = ImageElement | ShelfElement | ZoomElement | PointElement;
