/**
 * This file is for the type def of const var for Both SSR and CSR Usage
 */

export type MemoInfo = {
  pages: number,
  count: {
    memos: number,
    tags: number,
    imgs: number,
  },
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
  tags: string[];
  imgsmd: string[];
  sourceFile: string;
  csrIndex: [number, number]; // page index
};

/**
 * map<name,memoIds>
 */
export type MemoTag = Map<string, string[]>
export type MemoTagArr = Array<[string, string[]]>

export type MemoImgs = {
  memoId: string,
  imgsmd: string[]
}
