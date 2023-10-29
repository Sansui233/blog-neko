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

export const INFOFILE = "status.json"

export type MemoPost = {
  id: string;
  content: string;
  imgurls: string[];
  sourceFile: string;
  csrIndex: [number, number]; // page index
};
export type MemoTag = {
  name: string;
  list: {
    memoId: string;
    sourceFile: string;
    csrPage: number;
  }[];
};

