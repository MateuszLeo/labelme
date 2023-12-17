import { newImageElement, newPointElement, uuid } from "./Element";
import { createFile, loadImage, useFileStore, useImageCache } from "./file";
import { useUIStateStore } from "./UIStateContext";

export function useAddImage() {
  const imageCache = useImageCache();
  const uiStateStore = useUIStateStore();
  const fileStore = useFileStore();

  async function addImage(file: File | Blob) {
    const fileId = uuid();
    const dataURLFile = await createFile(fileId, file);
    const image = await loadImage(dataURLFile.dataURL);
    imageCache.set(fileId, image);
    fileStore.add(dataURLFile);

    const x = (uiStateStore.width / 2) - (image.naturalWidth / 2);
    const y = (uiStateStore.height / 2) - (image.naturalHeight / 2);

    const boundPoint = newPointElement(x, y);
    const imageElement = newImageElement({
      fileId,
      width: image.naturalWidth,
      height: image.naturalHeight,
      boundPointId: boundPoint.id,
    });

    uiStateStore.addElements(boundPoint, imageElement);
  }

  return addImage;
}
