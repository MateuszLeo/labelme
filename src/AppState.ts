import { makeAutoObservable } from "mobx";
import { newShelfElement } from "./constructors";
import { ImageElement, LabelMeElement, PointElement, PointTuple, ShelfElement, ZoomElement } from "./Element";

export type Tool = "selection" | "draw";

export type AppStateStatus = "idle" | "ready";

export class AppState {
  width = 0;
  height = 0;
  selection = {
    strokeColor: "rgba(61, 90, 254, 1)",
    fillColor: "rgba(61, 90, 254, 0.2)",
  };

  _canvas: HTMLCanvasElement | null = null;

  _imageElement: ImageElement | null = null;
  _status: AppStateStatus = "idle";

  _elements: LabelMeElement[] = [];

  _zoomElement: ZoomElement | null = null;
  _selectedElement: ShelfElement | null = null;
  _editingElement: ShelfElement | null = null;

  _tool: Tool = "selection";

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    makeAutoObservable(this);
  }

  set canvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  get canvas() {
    if (!this._canvas) {
      throw new Error("Canvas is not defined");
    }
    return this._canvas;
  }

  get tool() {
    return this._tool;
  }

  set tool(mode: Tool) {
    this._tool = mode;
  }

  get status() {
    return this._status;
  }

  set status(status: AppStateStatus) {
    this._status = status;
  }

  get zoomElement() {
    return this._zoomElement;
  }

  set zoomElement(zoomElement: ZoomElement | null) {
    this._zoomElement = zoomElement;
  }

  get selectedElement() {
    return this._selectedElement;
  }

  set selectedElement(id: ShelfElement | null) {
    this._selectedElement = id;
  }

  get editingElement() {
    return this._editingElement;
  }

  set editingElement(element: ShelfElement | null) {
    this._editingElement = element;
  }

  initializeShelves(
    shelves: PointTuple[][],
  ) {
    const elements = shelves.map((t) => {
      return newShelfElement(
        t.map<PointTuple>(([x, y]) => {
          return [x + this.imageElement.bounds.x, y + this.imageElement.bounds.y];
        }),
      );
    });
    this.addElements(...elements);
  }

  get shelvesPoints() {
    return this.elements.filter((e): e is ShelfElement => e.type === "shelf").map((shelf) => {
      return shelf.points.map<PointTuple>((point) => {
        return [point.x - this.imageElement.bounds.x, point.y - this.imageElement.bounds.y];
      });
    });
  }

  setImageElement(imageElement: ImageElement) {
    this._imageElement = imageElement;
    this.addElements(imageElement);
  }

  get imageElement() {
    if (!this._imageElement) {
      throw new Error("Image element is not defined");
    }
    return this._imageElement;
  }

  get elements() {
    return this._elements;
  }

  addElements(...elements: LabelMeElement[]) {
    this._elements.push(...elements);
  }

  drawShelfElement(shelf: ShelfElement, p: PointTuple) {
    const [, topRight, bottomRight, bottomLeft] = shelf.points;
    topRight.x = p[0];
    bottomRight.x = p[0];
    bottomRight.y = p[1];
    bottomLeft.y = p[1];
  }

  mutateElement(element: LabelMeElement, delta: PointTuple) {
    if (element.type === "shelf") {
      if (this._elements[this._elements.length - 1] !== element) {
        const index = this._elements.indexOf(element);
        this._elements.splice(index, 1);
        this._elements.push(element);
      }
      this.mutatePoints(delta, ...element.points);
    } else if (element.type === "zoom") {
      this.mutatePoints(delta, element.point);
    } else if (element.type === "point") {
      this.mutatePoints(delta, element);
    }
  }

  mutatePoints([dx, dy]: PointTuple, ...points: PointElement[]) {
    for (const point of points) {
      point.x += dx;
      point.y += dy;
    }
  }

  removeElement(element: LabelMeElement) {
    const idx = this.elements.indexOf(element);
    if (idx === -1) {
      return;
    }
    this._elements.splice(idx, 1);
  }

  removeCurrentElement() {
    if (!this.selectedElement) {
      return;
    }
    this.removeElement(this.selectedElement);
    this.selectedElement = null;
  }
}
