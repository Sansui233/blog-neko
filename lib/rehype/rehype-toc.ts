// Code from https://github.com/hashicorp/next-mdx-remote/issues/231

import { Root } from "hast";
import { visit } from "unist-util-visit";
import { headingRank, toString } from "./hast-util";

/** extract headings**/
// export const rehypeExtractHeadings = ({
//   rank = [1, 2, 3],
//   headings = [],
// }) => {
//   return (tree: Root) => {
//     visit(tree, "element", function (node) {
//       // console.log('%% node', node, '%% rank ', headingRank(node))
//       // see interface Element extends Parent in https://github.com/DefinitelyTyped/DefinitelyTyped/blob/9b98e4d8d2b09b305e2eb3885b4e46a1ace7ae33/types/hast/index.d.ts
//       if (rank.includes(headingRank(node)) && hasProperty(node, "id")) {

//         headings.push({
//           title: toString(node),
//           rank: headingRank(node),
//           id: node.properties.id.toString()
//         })
//       }
//     })
//   }
// }

/** setting heading id */
export function rehypeHeadingsAddId() {
  return function transformer(tree: Root) {
    visit(tree, "element", function (node) {
      if(headingRank(node)){
        const text = toString(node);
        const anchorId = text.toLowerCase().replace(/\s+/g, '-');
        node.properties = node.properties || {};
        node.properties.id = anchorId;
      }
    });
  };
};