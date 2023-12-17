import { PointTuple } from "./UIState.ts";

export function uuid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface BaseElement {
  id: string;
}

export interface PointElement extends BaseElement {
  type: "point";
  radius: number;
  x: number;
  y: number;
}

export function newPointElement(x: number, y: number): PointElement {
  return { id: uuid(), type: "point", radius: 10, x, y };
}

export interface QuadrangleElement extends BaseElement {
  type: "quadrangle";
  topLeftPointId: string;
  topRightPointId: string;
  bottomRightPointId: string;
  bottomLeftPointId: string;
}

export function newQuadrangleElement(q: Omit<QuadrangleElement, "id" | "type">): QuadrangleElement {
  return {
    id: uuid(),
    type: "quadrangle",
    ...q,
  };
}

export interface ImageElement extends BaseElement {
  type: "image";
  fileId: string;
  width: number;
  height: number;
  boundPointId: string;
}

export interface ShelfElement extends BaseElement {
  type: "shelf";
  color: string;
  quadrangleId: string;
}

export type LabelMeElement = ImageElement | ShelfElement | PointElement | QuadrangleElement;

export function newBaseElement(): BaseElement {
  return {
    id: uuid(),
  };
}

export function newImageElement(
  opts: Pick<ImageElement, "fileId" | "boundPointId" | "width" | "height">,
): ImageElement {
  return {
    ...newBaseElement(),
    type: "image",
    fileId: opts.fileId,
    width: opts.width,
    height: opts.height,
    boundPointId: opts.boundPointId,
  };
}

export function newShelfElement(quadrangle: QuadrangleElement, color: string): ShelfElement {
  return {
    ...newBaseElement(),
    type: "shelf",
    quadrangleId: quadrangle.id,
    color: color,
  };
}

export function newShelfFromTuples(points: PointTuple[]) {
  const [topLeftTuple, topRightTuple, bottomRightTuple, bottomLeftTuple] = points;
  const topLeft = newPointElement(...topLeftTuple);
  const topRight = newPointElement(...topRightTuple);
  const bottomRight = newPointElement(...bottomRightTuple);
  const bottomLeft = newPointElement(...bottomLeftTuple);
  const quadrangle = newQuadrangleElement({
    topLeftPointId: topLeft.id,
    topRightPointId: topRight.id,
    bottomRightPointId: bottomRight.id,
    bottomLeftPointId: bottomLeft.id,
  });
  const shelfElement = newShelfElement(quadrangle, randomRGBA());

  return [
    shelfElement,
    quadrangle,
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  ] as const;
}

export function getPoints(elements: LabelMeElement[], ...ids: string[]) {
  return elements.filter((e): e is PointElement => {
    return e.type === "point" && ids.includes(e.id);
  })!;
}

export function getQuadrangles(elements: LabelMeElement[], ...ids: string[]) {
  return elements.filter((e): e is QuadrangleElement => {
    return e.type === "quadrangle" && ids.includes(e.id);
  })!;
}

export function randomRGBA() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgba(${r},${g},${b},0.5)`;
}
