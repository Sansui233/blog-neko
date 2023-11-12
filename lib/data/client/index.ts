import { Extend } from "../../../utils/typeinfer";
import { MemoImgs as MemoImg, MemoInfo, MemoPost, MemoTag } from "../memos.common";

export interface Client {
  getMemoInfo: () => Promise<Extend<MemoInfo>>
  queryMemoByCount: (start: number, len: number) => Promise<MemoPost[]>
  queryMemoByDate: (latest: Date, oldest: Date) => Promise<MemoPost[]>
  queryMemoTags: (start: Date, end: Date) => Promise<MemoTag[]>
  queryMemoImgs: (start: Date, end: Date) => Promise<MemoImg[]>
}


/**
 * name: Client
 */
const clientList = {

}

export function createClient(name: keyof typeof clientList){
  if(!clientList[name]) console.error(`[client.ts] client ${name} not in clientList`)
  return clientList[name]
}