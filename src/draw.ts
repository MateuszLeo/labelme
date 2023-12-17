import { getPoints, getQuadrangles, ImageElement, LabelMeElement, PointElement, ShelfElement } from "./Element";

interface DrawConfig {
  canvas: HTMLCanvasElement;
  imageCache: Map<string, HTMLImageElement>;
  elements: LabelMeElement[];
  selectedElementId: string | null;
}

const selectionFillColor = "rgba(61, 90, 254, 0.2)";
const selectionStrokeColor = "rgba(61, 90, 254, 1)";

function drawShelf(shelfElement: ShelfElement, context: CanvasRenderingContext2D, drawConfig: DrawConfig) {
  const isSelected = drawConfig.selectedElementId === shelfElement.id;

  if (isSelected) {
    context.fillStyle = selectionFillColor;
    context.strokeStyle = selectionStrokeColor;
  } else {
    context.fillStyle = shelfElement.color;
    context.strokeStyle = shelfElement.color;
  }

  const [quadrangle] = getQuadrangles(drawConfig.elements, shelfElement.quadrangleId);
  const points = getPoints(
    drawConfig.elements,
    quadrangle.topLeftPointId,
    quadrangle.topRightPointId,
    quadrangle.bottomRightPointId,
    quadrangle.bottomLeftPointId,
  );

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

  function drawPointIndicator(p: PointElement) {
    context.beginPath();
    context.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  }

  drawShape();
  if (isSelected) {
    context.fillStyle = selectionStrokeColor;
    for (const point of points) {
      drawPointIndicator(point);
    }
  }
}

function drawImage(img: ImageElement, context: CanvasRenderingContext2D, renderConfig: DrawConfig) {
  const image = renderConfig.imageCache.get(img.fileId)!;
  const [boundPoint] = getPoints(renderConfig.elements, img.boundPointId);

  context.drawImage(
    image,
    boundPoint.x,
    boundPoint.y,
    img.width,
    image.height,
  );
}

function drawElement(element: LabelMeElement, context: CanvasRenderingContext2D, drawConfig: DrawConfig) {
  switch (element.type) {
    case "image":
      drawImage(element, context, drawConfig);
      break;
    case "shelf":
      drawShelf(element, context, drawConfig);
      break;
    default:
      break;
  }
}

function prepareCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

export function drawElements(config: DrawConfig) {
  const ctx = prepareCanvas(config.canvas);
  for (const element of config.elements) {
    drawElement(element, ctx, config);
  }
}
