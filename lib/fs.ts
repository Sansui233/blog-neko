import fs from "fs";
import path from "path";

export function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

export function writeToFs(dir: string, filename: string, data: any) {
  mkdirsSync(dir)
  fs.writeFile(path.join(dir, filename), JSON.stringify(data), "utf8", (err) => {
    if (err) {
      console.error(`[fs.ts] Wrtie ${filename} to ${dir} failed: `, err)
      throw err
    }
  })
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

export async function loadJson(filePath: string) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8')
    const jsonObject = JSON.parse(data);
    return jsonObject
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') { // file not found error
      console.error(`[fs.ts] File not found ${filePath}`);
    } else {
      console.error(`[fs.ts] Error when Parse ${filePath}`, err);
      throw err
    }
  }
}