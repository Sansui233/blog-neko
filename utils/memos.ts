import fs from "fs";
import readline from 'readline'
import path from "path"

const memosDir = path.join(process.cwd(), 'source','memos')

type MemoPost = {
  title: string;
  content: string;
}

export async function getMemoPosts(): Promise<MemoPost[]>{
  let fileNames = fs.readdirSync(memosDir);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md")
  }).sort((a,b) => {
    return a < b ? -1 : 1
  })

  const memos: MemoPost[] = []

  // Generate memos
  for (const fileName of fileNames) {
    const fullPath = path.join(memosDir, fileName)
    const fileStream = fs.createReadStream(fullPath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    for await (const line of rl) {
      if(line.startsWith("## ")){
        memos.push({
          title: line.slice(3),
          content: "",
        })
      }else{
        if(memos.length === 0 ) continue
        memos[memos.length-1].content += line + "\n"
      }
    }
  }

  // convert to html
  return memos
}
