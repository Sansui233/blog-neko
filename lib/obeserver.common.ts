export interface FInfo {
  name: string,
  mtime?: number,
  md5?: string,
}

export interface DInfo<U extends FInfo> {
  fileMap: Array<U>
}