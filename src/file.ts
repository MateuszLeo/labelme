import { makeAutoObservable } from "mobx";
import { createContext, useContext } from "react";

interface DataURLFile {
  id: string;
  dataURL: string;
}

export class FileStore {
  _files: Record<string, DataURLFile> = {};

  constructor() {
    makeAutoObservable(this);
  }

  add(file: DataURLFile) {
    this._files[file.id] = file;
  }

  get(id: string) {
    return this._files[id];
  }
}

const FileContext = createContext(new FileStore());

export function useFileStore() {
  return useContext(FileContext);
}
export async function createFile(id: string, file: Blob | File): Promise<DataURLFile> {
  const dataURL = await getDataURL(file);
  return {
    id,
    dataURL,
  };
}

const ImageCacheContext = createContext(new Map<string, HTMLImageElement>());

export function useImageCache() {
  return useContext(ImageCacheContext);
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
