import { Root } from "mdast"
import { visit } from "unist-util-visit"

// 将 #标签 替换为 <Tag text={"#标签"} /> ，以解决与react hook的交互问题和事件绑定问题
export function remarkTag() {
  return function (tree: Root) {
    visit(tree, function (node, index, parent) {
      // console.log("%%%%%%%%%%%",node.type)
      if(node.type === "paragraph"){

        const newChildren:any[] = []
        node.children.forEach(child => {
          if(child.type === "text"){ 

            const text = child.value
            const tags = extractTags(text)
            

            const delimiters = tags.map(t =>"#"+t+" ")

            if (tags.length>0) {
              const parts = flatsplit(text,delimiters)

              const endingTag = "#" + tags[tags.length-1]
              const endingText = parts[parts.length-1].text
              if(endingText.endsWith(endingTag)){
                parts[parts.length-1] = {
                  text: endingText.slice(0, endingText.length - endingTag.length),
                  isDelimiter: false
                }
                parts.push({
                  text: endingTag,
                  isDelimiter: true
                })
              }

              parts.forEach(part => {
                // reconstuct hast
                if(part.isDelimiter){

                  const newNode = {
                    type: 'mdxJsxFlowElement',
                    name: "Tag",
                    attributes: [{
                      type: 'mdxJsxAttribute',
                      name: 'text',
                      value: part.text.slice(1) // ignore # mark
                    }]
                  };

                  newChildren.push(newNode); // push tag node

                }else {
                  newChildren.push({type: "text", value: part.text}) // push text node
                }
              })
            }else{
              newChildren.push(child) // not tag detected
            }
          }else{
            newChildren.push(child) // push none-text
          }
        })

        node.children = newChildren

      }
    })
  }
}

// todo: test cases
function flatsplit(input: string, delimiters: string[]):Array<{text: string, isDelimiter: boolean}> {
  // boundary
  if(delimiters.includes(input)){
    return [{text: input, isDelimiter: true}]
  }

  let res:{
    text: string,
    isDelimiter: boolean
  }[] = [{ text : input, isDelimiter: false}]

  // split by delimiters
  for (const d of delimiters) {

    let temp: {
      text: string,
      isDelimiter: boolean
    }[]  = []


    for (const part of res) {

      if(part.isDelimiter){
        temp.push(part)
        continue
      }

      const splitParts = part.text.split(d)
      for (let i = 0; i < splitParts.length; i++) {
        temp.push({
          text: splitParts[i],
          isDelimiter: false
        });

        // ending boundary
        if(i === splitParts.length-1 && splitParts[i] !== ""){
          break
        }else{
          temp.push({
            text: d,
            isDelimiter: true
          });
        }
      }
    }
    res = temp
  }
  return res.filter(r => r.text !== "")
}

function extractTags(markdown: string) {
  const tagRegex = /#([^\s#]+)(?![^\[]*\])/g;

  const tags = [];
  let match;
  while ((match = tagRegex.exec(markdown)) !== null) {
    const tag = match[1];
    // 检查标签的长度是否不超过14
    if (tag.length <= 14) {
      tags.push(tag);
    }
  }

  return tags;
}
