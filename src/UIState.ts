import { makeAutoObservable } from "mobx";
import { LabelMeElement, PointElement, QuadrangleElement, ShelfElement } from "./Element";

export type PointTuple = [x: number, y: number];

type Tool = "selection" | "draw";

export class UIStateStore {
  width = 0;
  height = 0;

  // TODO: make it map?
  _elements: LabelMeElement[] = [];
  _selectedElement: LabelMeElement | null = null;
  _tool: Tool = "selection";

  constructor(width: number, height: number, elements: LabelMeElement[] = []) {
    this.width = width;
    this.height = height;
    this._elements = elements;
    makeAutoObservable(this);
  }

  get tool() {
    return this._tool;
  }

  set tool(mode: Tool) {
    this._tool = mode;
  }

  get selectedElement() {
    return this._selectedElement;
  }

  set selectedElement(element: LabelMeElement | null) {
    this._selectedElement = element;
  }

  get elementById() {
    const byId = new Map<string, LabelMeElement>();
    for (const element of this._elements) {
      byId.set(element.id, element);
    }
    return byId;
  }

  addElements(...elements: LabelMeElement[]) {
    this._elements.push(...elements);
  }

  drawShelfElement(id: string, p: PointTuple) {
    const [, topRight, bottomRight, bottomLeft] = this.getShelfPoints(id);
    topRight.x = p[0];

    bottomRight.x = p[0];
    bottomRight.y = p[1];

    bottomLeft.y = p[1];
  }

  mutateElement(id: string, delta: PointTuple) {
    const element = this.elementById.get(id)!;
    switch (element.type) {
      case "point":
        this.mutatePoints(delta, element);
        break;
      case "shelf":
        {
          // TODO: POP ON TOP mutated element
          this.mutatePoints(delta, ...this.getShelfPoints(id));
        }
        break;
      default:
        break;
    }
  }

  mutatePoints([dx, dy]: PointTuple, ...points: PointElement[]) {
    for (const point of points) {
      point.x += dx;
      point.y += dy;
    }
  }

  get elements() {
    return this._elements;
  }

  deleteCurrentElement() {
    if (!this.selectedElement) {
      return;
    }
    const element = this.elements.indexOf(this.selectedElement);
    if (element !== -1) {
      this._elements.splice(element, 1);
      this.selectedElement = null;
    }
  }

  getShelfPoints(id: string) {
    const shelf = this.elementById.get(id)! as ShelfElement;
    const quadrangle = this.elementById.get(shelf.quadrangleId)! as QuadrangleElement;
    return [
      this.elementById.get(quadrangle.topLeftPointId)!,
      this.elementById.get(quadrangle.topRightPointId)!,
      this.elementById.get(quadrangle.bottomRightPointId)!,
      this.elementById.get(quadrangle.bottomLeftPointId)!,
    ] as PointElement[];
  }
}
