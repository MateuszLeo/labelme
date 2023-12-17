import { getPoints, getQuadrangles, LabelMeElement, PointElement, ShelfElement } from "./Element";
import { PointTuple } from "./UIState";

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
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function inShelf(p: PointTuple, shelf: ShelfElement, elements: LabelMeElement[]) {
  const [quadrangle] = getQuadrangles(elements, shelf.quadrangleId);
  return inPolygon(
    p,
    getPoints(
      elements,
      quadrangle.topRightPointId,
      quadrangle.topLeftPointId,
      quadrangle.bottomRightPointId,
      quadrangle.bottomLeftPointId,
    ),
  );
}

export function detectElement(point: PointTuple, elements: LabelMeElement[]): LabelMeElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    switch (element.type) {
      case "point": {
        if (inPoint(point, element)) {
          return element;
        }
        break;
      }
      case "shelf": {
        if (inShelf(point, element, elements)) {
          return element;
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  return null;
}
