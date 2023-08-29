// Code from https://github.com/hashicorp/next-mdx-remote/issues/231

import { hasProperty } from "hast-util-has-property"
import { headingRank } from "hast-util-heading-rank"
import { toString } from "hast-util-to-string"
import { visit } from "unist-util-visit"

/** extract headings**/
export const rehypeExtractHeadings = ({
  rank = [1, 2, 3],
  headings = [],
}) => {
  return (tree) => {
    visit(tree, "element", function (node) {
      // console.log('%% node', node, '%% rank ', headingRank(node))
      if (rank.includes(headingRank(node)) && hasProperty(node, "id")) {

        headings.push({
          title: toString(node),
          rank: headingRank(node),
          id: node.properties.id.toString()
        })
      }
    })
  }
}

/** setting heading id */
export function rehypeAddAnchors() {
  return function transformer(tree) {
    visit(tree, "element", function (node) {
      if (node.tagName === 'h2' || node.tagName === 'h3') {
        const text = node.children
          .filter((child) => child.type === 'text')
          .map((child) => child.value)
          .join('');

        const anchorId = text.toLowerCase().replace(/\s+/g, '-');
        
        node.properties = node.properties || {};
        node.properties.id = anchorId;
      }
    });
  };
};