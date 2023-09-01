/**
 * Monitoring if file in an directory has been modified or not
*/

import fs from "fs";
import path from "path";
import { getStat, loadJson, writeJson } from "./fs";
import { DInfo, FInfo } from "./obeserver.common";

/**
 * 
 * use an infoFile to observe directory
 * @param dir directory to be observed
 * @param infoPath a full path where the status stored
 * @param isIdentical a callback that returns the comparison method
 * @param filter a string that file name contains
 * @param updateInfoFile whether write InfoFile
 * @returns modifed-file list
 */
export async function observe<T extends DInfo<U>, U extends FInfo>(
  dir: string,
  infoPath: string,
  isIdentical: (oldstatus: U, newstatus: fs.Stats) => boolean,
  filter?: string,
  updateInfoFile = false,
) {

  // read old status
  let oldInfo = (await loadJson(infoPath)) as T

  // filter new files and sort
  let fileNames = await fs.promises.readdir(dir)
  if (filter) {
    fileNames = fileNames.filter(f => {
      return f.includes(filter)
    })
  }

  fileNames = fileNames.sort((a, b) => {
    return a < b ? -1 : 1 // ASC for old first
  })

  // res
  const list = {
    mod: new Array<string>(),
    del: new Array<string>(),
    create: new Array<string>()
  }
  const newInfo: DInfo<FInfo> = {
    fileMap: new Array<FInfo>()
  }

  // 经典的双链表排序问题
  // 读 oldInfo 和 filenames，按排序后的名字比较
  let i = 0, j = 0;
  if (oldInfo) {
    for (let i = 0; i < oldInfo.fileMap.length; i++) {
      for (let j = 0; j < fileNames.length; j++) {

        const oldfile = oldInfo.fileMap[i].name
        const oldstat = oldInfo.fileMap[i]
        const newfile = fileNames[j]
        const newstat = await (getStat(path.join(dir, newfile)));

        if (updateInfoFile) {
          newInfo.fileMap.push({
            name: newfile
          })
        }

        if (!newstat) {
          j++;
          continue
        }

        if (oldfile < newfile) {
          list.del.push(oldfile);
          i++;
          break;
        }

        if (oldfile === newfile) {
          const res = isIdentical(oldstat, newstat)
          if (!res) {
            list.mod.push(oldfile);
          }
          i++; j++;
          continue
        }

        if (oldfile > newfile) {
          list.create.push(newfile);
          j++;
          continue;
        }
      }

      while (i < oldInfo.fileMap.length) {
        list.del.push(oldInfo.fileMap[i].name)
        i++
      }
      while (j < fileNames.length) {
        list.create.push(fileNames[j])
        j++
      }

    }
  }

  if (updateInfoFile) {
    writeJson("", infoPath, newInfo)
  }

  return list
}