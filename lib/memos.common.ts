/**
 * This file is for the type def of const var for Both SSR and CSR Usage
 */

export type MemoInfo = {
  pages: number,
  fileMap: FileInfo[]
}
export type FileInfo = {
  srcName: string,
  lastModified: number,
  startAt: {
    page: number,
    index: number,
  },
  endAt: {
    page: number,
    index: number,
  }
}

export const INFOFILE = "memosinfo.json"
