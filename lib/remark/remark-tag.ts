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
            if (text && text.match(/#([^# ]+) /)) {
              
              const parts = text.split(/#([^# ]+) /);
              for (let i = 0; i < parts.length; i++) { // reconstruct AST
                if (i % 2 === 0) { // 偶数为非标签内容
                  newChildren.push({ type: 'text', value: parts[i] });
                } else { // 奇数为非标签内容，替换之
                  const newNode = {
                    type: 'mdxJsxFlowElement',
                    name: "Tag",
                    attributes: [{
                      type: 'mdxJsxAttribute',
                      name: 'text',
                      value: `${parts[i]}`
                    }]
                  };
                  newChildren.push(newNode); // push tag
                }
              }

            }else{
              newChildren.push(child) //  push original text
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