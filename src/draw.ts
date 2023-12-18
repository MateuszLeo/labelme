import { AppState } from "./AppState";
import { ImageElement, LabelMeElement, PointElement, ShelfElement, ZoomElement } from "./Element";

interface DrawConfig {
  canvas: HTMLCanvasElement;
  imageCache: Map<string, HTMLImageElement>;
  appState: AppState;
}

function drawShelf(shelfElement: ShelfElement, context: CanvasRenderingContext2D, drawConfig: DrawConfig) {
  const isSelected = shelfElement === drawConfig.appState.selectedElement;

  if (isSelected) {
    context.fillStyle = drawConfig.appState.selection.fillColor;
    context.strokeStyle = drawConfig.appState.selection.strokeColor;
  } else {
    context.fillStyle = shelfElement.color;
    context.strokeStyle = shelfElement.color;
  }

  const points = shelfElement.points;

  function drawShape() {
    const shape = new Path2D();

    const [p1, p2, p3, p4] = points;

    shape.moveTo(p1.x, p1.y);
    shape.lineTo(p2.x, p2.y);
    shape.lineTo(p3.x, p3.y);
    shape.lineTo(p4.x, p4.y);
    shape.closePath();

    context.stroke(shape);
    context.fill(shape);
  }

  drawShape();

  function drawPointIndicator(p: PointElement) {
    context.beginPath();
    context.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
    context.fill();
  }

  if (isSelected) {
    context.strokeStyle = drawConfig.appState.selection.strokeColor;
    for (const point of shelfElement.points) {
      drawPointIndicator(point);
    }
  }
}

export function drawImage(img: ImageElement, context: CanvasRenderingContext2D, renderConfig: DrawConfig) {
  const image = renderConfig.imageCache.get(img.fileId)!;
  const boundPoint = img.bounds;

  context.drawImage(
    image,
    boundPoint.x,
    boundPoint.y,
    img.width,
    image.height,
  );
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

export function drawZoom(zoomElement: ZoomElement, context: CanvasRenderingContext2D) {
  const point = zoomElement.point;

  const imageData = context.getImageData(
    point.x - point.radius / 2,
    point.y - point.radius / 2,
    point.radius,
    point.radius,
  );

  ctx.putImageData(imageData, 0, 0);
  context.drawImage(
    canvas,
    0,
    0,
    point.radius,
    point.radius,
    0,
    0,
    point.radius * zoomElement.size,
    point.radius * zoomElement.size,
  );
}

function drawElement(element: LabelMeElement, context: CanvasRenderingContext2D, drawConfig: DrawConfig) {
  if (element.type === "image") {
    drawImage(element, context, drawConfig);
  } else if (element.type === "shelf") {
    drawShelf(element, context, drawConfig);
  }
}

function prepareCanvas(canvas: HTMLCanvasElement, willReadFrequently: boolean = false) {
  const ctx = canvas.getContext("2d", { willReadFrequently })!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

export function drawElements(config: DrawConfig) {
  const ctx = prepareCanvas(config.canvas, Boolean(config.appState.zoomElement));

  for (const element of config.appState.elements) {
    drawElement(element, ctx, config);
  }

  if (config.appState.zoomElement) {
    drawZoom(config.appState.zoomElement, ctx);
  }
}
