import fs from "fs";
import path from "path";

/**
 * mkdir recursively
 */
function mkdirSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  } else if (dirname === "") {
    console.debug("unexpected blank dir")
    return true
  } else {
    // Recursively mkdir
    if (mkdirSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }

}

export async function getLastModTime(filePath: string) {
  try {
    const stats = await fs.promises.stat(filePath);
    const lastModified = stats.mtime; // 获取上次修改时间
    return lastModified;
  } catch (err) {
    console.error(`[fs.ts] Error when get last modifed time of ${filePath}, return Date to now`, err);
    return new Date()
  }
}

export async function getStat(filePath: string) {
  try {
    return fs.promises.stat(filePath);
  } catch (err) {
    console.error(`[fs.ts] Error when get stat of ${filePath}, return undefined`, err);
    return undefined
  }
}

/**
 * PLEASE CHeCK if returned obj exsits or not！
 */
export async function loadJson(filePath: string) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8')
    const jsonObject = JSON.parse(data);
    return jsonObject
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') { // file not found error
      console.error(`[fs.ts] File not found ${filePath}`);
      return null;
    } else {
      console.error(`[fs.ts] Error when Parse ${filePath}`, err);
      throw err
    }
  }
}

/**
 * writeJson(dir, "a.json", object)
 */
export async function writeJson(filepath: string, data: object) {
  mkdirSync(path.dirname(filepath))
  try {
    await fs.promises.writeFile(filepath, JSON.stringify(data), "utf8")
  } catch (error) {
    console.error(`[fs.ts] Wrtie ${filepath} failed: `, error)
  }
}