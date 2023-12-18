export interface DataURLFile {
  id: string;
  dataURL: string;
}

export async function createFile(id: string, file: Blob | File): Promise<DataURLFile> {
  const dataURL = await getDataURL(file);
  return {
    id,
    dataURL,
  };
}

export async function getDataURL(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result as string;
      resolve(dataURL);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function loadImage(dataURL: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}
