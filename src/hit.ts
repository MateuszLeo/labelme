import { LabelMeElement, PointElement, PointTuple, ShelfElement } from "./Element";

function inPoint([x, y]: PointTuple, p: PointElement) {
  return (
    p.x - p.radius <= x
    && x <= p.x + p.radius
    && p.y - p.radius <= y
    && y <= p.y + p.radius
  );
}

function inPolygon([x, y]: PointTuple, points: PointElement[]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const { x: xi, y: yi } = points[i];
    const { x: xj, y: yj } = points[j];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function inShelf(p: PointTuple, shelf: ShelfElement): Hit | null {
  for (const point of shelf.points) {
    if (inPoint(p, point)) {
      return {
        type: "resize",
        element: shelf,
        point,
      };
    }
  }

  const isIn = inPolygon(
    p,
    shelf.points,
  );

  if (isIn) {
    return {
      type: "move",
      element: shelf,
    };
  }

  return null;
}

export interface Resize {
  type: "resize";
  element: ShelfElement;
  point: PointElement;
}

export interface Move {
  type: "move";
  element: ShelfElement;
}

export type Hit = Resize | Move;

export function getHitAtPosition(
  point: PointTuple,
  elements: LabelMeElement[],
): Hit | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (element.type === "shelf") {
      const maybeHit = inShelf(point, element);
      if (maybeHit) {
        return maybeHit;
      }
    }
  }
  return null;
}
