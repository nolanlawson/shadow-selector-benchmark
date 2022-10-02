// via https://github.com/vuejs/core/blob/9c304bfe7942a20264235865b4bb5f6e53fdee0d/packages/compiler-sfc/src/stylePluginScoped.ts
import selectorParser from 'postcss-selector-parser';

const animationNameRE = /^(-\w+-)?animation-name$/;
const animationRE = /^(-\w+-)?animation$/;

const warn = console.warn.bind(console)

let useClasses = false

export const setUseClasses = (val) => {
  useClasses = val
}

let mode = 'last'

export const setMode = val => {
  mode = val
}

let componentTag

export const setComponentTag = val => {
  componentTag = val
}

const scopedPlugin = (id = '') => {
  return {
    postcssPlugin: 'vue-sfc-scoped',
    Rule(rule) {
      processRule(id, rule);
    }
  };
};
function processRule(id, rule) {
  rule.selector = selectorParser(selectorRoot => {
    selectorRoot.each(selector => {
      rewriteSelector(id, selector, selectorRoot);
    });
  }).processSync(rule.selector);
}
function rewriteSelector(id, selector) {

  function scopeNode(thisNode) {
    thisNode.spaces.after = '';
    const after = useClasses ? selectorParser.className({
      value: id,
      raws: {},
      quoteMark: `"`
    }) : selectorParser.attribute({
      attribute: id,
      value: id,
      raws: {},
      quoteMark: `"`
    })
    selector.insertAfter(
      // If node is null it means we need to inject [id] at the start
      // insertAfter can handle `null` here
      thisNode, after);
  }

  const nodes = []
  selector.each(currentNode => {
    nodes.push(currentNode)
  });

  if (mode === 'last') {
    scopeNode(nodes[nodes.length - 1])
  } else if (mode === 'every') {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const nextNode = nodes[i + 1]
      if (!nextNode || nextNode.type === 'combinator') {
        scopeNode(node)
      }
    }
  } else { // prefix
    const tag = selectorParser.tag({
      value: componentTag,
      raws: {},
      quoteMark: `"`
    })
    tag.spaces.after = ' '
    selector.insertBefore(nodes[0], tag)
  }
}
function isSpaceCombinator(node) {
  return node.type === 'combinator' && /^\s+$/.test(node.value);
}
scopedPlugin.postcss = true;
export{  scopedPlugin };