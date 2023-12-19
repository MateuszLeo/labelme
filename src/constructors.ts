import { AppState } from "./AppState";
import { BaseElement, ImageElement, PointElement, PointTuple, ShelfElement, ZoomElement } from "./Element.ts";
import { createFile, loadImage } from "./file.ts";

export function uuid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const testColor = "rgba(58, 150, 161, 0.8)";
const usedRGBAs = new Set<string>([testColor]);

export function randomRGBA() {
  // lazy way to make e2e tests deterministic
  if (import.meta.env.MODE === "test") {
    return testColor;
  }

  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  const rgba = `rgba(${r},${g},${b},0.8)`;
  if (usedRGBAs.has(rgba)) {
    return randomRGBA();
  }
  usedRGBAs.add(rgba);
  return rgba;
}

export function newBaseElement(): BaseElement {
  return { id: uuid() };
}

export function newPointElement([x, y]: PointTuple): PointElement {
  return { ...newBaseElement(), type: "point", radius: 10, x, y };
}

export function newShelfElement(q: PointTuple[]): ShelfElement {
  return {
    ...newBaseElement(),
    type: "shelf",
    color: randomRGBA(),
    points: q.map(newPointElement),
  };
}

export function newImageElement(
  opts: Pick<ImageElement, "fileId" | "bounds" | "width" | "height">,
): ImageElement {
  return {
    ...newBaseElement(),
    type: "image",
    fileId: opts.fileId,
    width: opts.width,
    height: opts.height,
    bounds: opts.bounds,
  };
}

export function newZoomElement(point: PointTuple): ZoomElement {
  const p = newPointElement(point);
  p.radius = 100;
  return { ...newBaseElement(), type: "zoom", point: p, size: 2 };
}

export const imageCache = new Map<string, HTMLImageElement>();

export async function newImageElementFromBlob(file: File | Blob, appState: AppState) {
  const fileId = uuid();
  const dataURLFile = await createFile(fileId, file);
  const image = await loadImage(dataURLFile.dataURL);
  imageCache.set(fileId, image);

  const x = (appState.width / 2) - (image.naturalWidth / 2);
  const y = (appState.height / 2) - (image.naturalHeight / 2);

  return newImageElement({
    fileId,
    width: image.naturalWidth,
    height: image.naturalHeight,
    bounds: newPointElement([x, y]),
  });
}
