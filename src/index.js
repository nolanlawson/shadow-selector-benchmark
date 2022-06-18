import {randomNumber, randomString, randomColor, randomTag, randomBool, randomChoice, randomCoin} from './rando.js';
import {scopeStyle} from './workerClient.js';

const $ = document.querySelector.bind(document)
const $$ = _ => [...document.querySelectorAll(_)]

const goButton = $('#go')
const useShadowDomInput = $('#useShadowDom')
const scopeStylesInput = $('#scopeStyles')
const numRulesInput = $('#numRules')
const numComponentsInput = $('#numComponents')
const numElementsInput = $('#numElements')
const numClassesInput = $('#numClasses')
const numAttributesInput = $('#numAttributes')
const container = $('#container')
const display = $('#display')

let scopeId = 0

goButton.addEventListener('click', e => {
  e.preventDefault()
  runTest()
})

async function runTest() {
  goButton.disabled = true
  try {
    await doRunTest()
  } finally {
    goButton.disabled = false
  }
}

function generateAttributeValueSelector({ name, value }) {
  return `[${name}=${JSON.stringify(value)}]`
}

function generateRandomCssRule({ classes, attributes, tags }) {

  function generateRandomFullSelector() {
    let str = ''
    do {
      str += generateRandomSelector(['tag', 'class', 'attributeName', 'attributeValue'])

      if (randomBool()) {
        str += generateRandomSelector(['class', 'attributeName', 'attributeValue', 'notClass', 'notAttribute']) // combinator selector
      }
      str += ' ' // descendant selector
    } while (randomBool())

    return str
  }

  function generateRandomSelector(selectorTypes) {
    const selectorType = randomChoice(selectorTypes)
    switch (selectorType) {
      case 'tag':
        return tags.length ? randomChoice(tags) : randomString()
      case 'class':
        return '.' + (classes.length ? randomChoice(classes) : randomString())
      case 'attributeName':
        return '[' + (attributes.length ? randomChoice(attributes.map(_ => _.name)) : randomString()) + ']'
      case 'attributeValue':
        return generateAttributeValueSelector(attributes.length ? randomChoice(attributes) : { name: randomString(), value: randomString() })
      case 'notClass':
        return ':not(.' + (classes.length ? randomChoice(classes) : randomString()) + ')'
      case 'notAttribute':
        return ':not([' + (attributes.length ? randomChoice(attributes.map(_ => _.name)) : randomString()) + '])'
    }
  }

  const selector = generateRandomFullSelector()

  return `${selector} { color: ${randomColor()}; }`
}

function generateRandomCss({ numRules, classes, attributes, tags }) {
  let str = ''

  for (let i = 0; i < numRules; i++) {
    str += generateRandomCssRule({ classes, attributes, tags }) + '\n\n'
  }

  return str
}

function createStyleTag(css) {
  const style = document.createElement('style')
  style.textContent = css
  return style
}

function injectGlobalCss(css) {
  document.head.appendChild(createStyleTag(css))
}

async function doRunTest() {
  const numComponents = parseInt(numComponentsInput.value, 10)
  const numElementsPerComponent = parseInt(numElementsInput.value, 10)
  const numClassesPerElement = parseInt(numClassesInput.value, 10)
  const numAttributesPerElement = parseInt(numAttributesInput.value, 10)
  const numRulesPerComponent = parseInt(numRulesInput.value, 10)
  const useShadowDom = useShadowDomInput.checked
  const scopeStyles = scopeStylesInput.checked

  container.innerHTML = ''
  $$('style').forEach(style => style.remove())

  async function generateRandomScopedCss({ numRules, classes, attributes, tags, scopeToken }) {
    const css = generateRandomCss({ numRules, classes, attributes, tags })
    if (!scopeStyles) {
      return css
    }
    return (await scopeStyle(css, scopeToken))
  }

  function createComponent({ scopeToken }) {
    const component = document.createElement('my-component')

    let renderRoot = component
    if (useShadowDom) {
      const shadow = renderRoot.attachShadow({ mode: 'open' })
      renderRoot = shadow
    }

    let lastElm

    const numElements = randomNumber(1, numElementsPerComponent * 2)

    const tags = []
    const classes = []
    const attributes = []

    for (let i = 0; i < numElements; i++) {
      const tag = randomTag()
      tags.push(tag)
      const elm = document.createElement(tag)
      elm.textContent = randomColor()

      const numClasses = randomNumber(0, (numClassesPerElement * 2) - 1)
      const numAttributes = randomNumber(0, (numAttributesPerElement * 2) - 1)

      for (let j = 0; j < numClasses; j++) {
        const clazz = randomString()
        classes.push(clazz)
        elm.classList.add(clazz)
      }

      for (let j = 0; j < numAttributes; j++) {
        const attribute = `data-${randomString()}`
        const attributeValue = randomString()
        attributes.push({ name: attribute, value: attributeValue })
        elm.setAttribute(attribute, attributeValue)
      }

      if (scopeToken) {
        elm.setAttribute(scopeToken, '')
      }

      // Chance of making the tree deeper or keeping it flat
      if (lastElm && randomCoin(0.9)) {
        lastElm.appendChild(elm)
      } else {
        renderRoot.appendChild(elm)
      }

      lastElm = elm
    }

    return { component, tags, classes, attributes }
  }

  const generateStylesheetPromises = []
  const globalStylesheets = []
  const localStylesheets = []
  const newRoot = document.createElement('div')
  let lastComponent

  for (let i = 0; i < numComponents; i++) {
    const scopeToken = scopeStyles && `scope-${++scopeId}`
    const { component, tags, classes, attributes } = createComponent({ scopeToken })

    const numRules = randomNumber(1, numRulesPerComponent * 2)

    generateStylesheetPromises.push((async () => {
      const stylesheet = await generateRandomScopedCss({ classes, tags, attributes, scopeToken, numRules })

      if (useShadowDom) {
        localStylesheets.push({ shadowRoot: component.shadowRoot, stylesheet })
      } else {
        globalStylesheets.push(stylesheet)
      }
    })())

    // Chance of making the tree deeper or keeping it flat
    if (lastComponent && randomCoin(0.75)) {
      (lastComponent.shadowRoot ?? lastComponent).appendChild(component)
    } else {
      newRoot.appendChild(component)
    }
    lastComponent = component
  }

  function flushStyles() {
    if (useShadowDom) {
      // We probably could have appended stylesheets to the shadow roots earlier,
      // but just in case browsers have some magic to process the stylesheet as early as possible,
      // do it at the same time we would be injecting global styles
      for (const { shadowRoot, stylesheet } of localStylesheets) {
        shadowRoot.appendChild(createStyleTag(stylesheet))
      }
    } else {
      const combinedStylesheet = globalStylesheets.join('\n\n')
      injectGlobalCss(combinedStylesheet)
    }
  }

  // Flush everything to the DOM in one go so we can measure accurately
  await Promise.all(generateStylesheetPromises)
  flushStyles()
  container.appendChild(newRoot)

  performance.mark('start')
  // requestPostAnimationFrame polyfill
  requestAnimationFrame(() => {
    addEventListener('message', () => {
      performance.measure('total', 'start')
      done()
    }, { once: true })
    postMessage('', '*')
  })
}

function done() {
  display.innerHTML += `${performance.getEntriesByType('measure').at(-1).duration}ms\n`
  // container.innerHTML = ''
  // $$('style').forEach(style => style.remove())
}