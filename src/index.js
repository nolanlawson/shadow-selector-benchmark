import {
  randomNumber,
  randomString,
  randomColor,
  randomTag,
  randomBool,
  randomChoice,
  randomCoin,
  resetRandomSeed
} from './rando.js';
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
const oneBigStyleInput = $('#oneBigStyle')
const useClassesInput = $('#useClasses')
const scopeModeInputLast = $('#scopeModeLast')
const scopeModeInputEvery = $('#scopeModeEvery')
const scopeModeInputPrefix = $('#scopeModePrefix')
const container = $('#container')
const display = $('#display')

let scopeId = 0
let componentTagNameIndex = 0

scopeStylesInput.addEventListener('change', () => {
  for (const input of [useClassesInput, scopeModeInputLast, scopeModeInputEvery, scopeModeInputPrefix]) {
    input.disabled = !scopeStylesInput.checked
  }
})

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
        str += generateRandomSelector(['class', 'attributeName', 'attributeValue', 'notClass', 'notAttribute', 'nthChild']) // combinator selector
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
      case 'nthChild':
        return `:nth-child(${randomNumber(1, 5)})`
    }
  }

  const selector = generateRandomFullSelector()

  return `${selector} { background-color: ${randomColor()}; }`
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

function reset() {
  container.innerHTML = ''
  $$('style').forEach(style => style.remove())
  resetRandomSeed()
  scopeId = 0
  componentTagNameIndex = 0
}

async function doRunTest() {
  const numComponents = parseInt(numComponentsInput.value, 10)
  const numElementsPerComponent = parseInt(numElementsInput.value, 10)
  const numClassesPerElement = parseInt(numClassesInput.value, 10)
  const numAttributesPerElement = parseInt(numAttributesInput.value, 10)
  const numRulesPerComponent = parseInt(numRulesInput.value, 10)
  const useShadowDom = useShadowDomInput.checked
  const scopeStyles = scopeStylesInput.checked
  const oneBigStyle = oneBigStyleInput.checked
  const useClasses = useClassesInput.checked
  const scopeMode = scopeModeInputLast.checked ? 'last' : scopeModeInputEvery.checked ? 'every' : 'prefix'

  reset()

  async function generateRandomScopedCss({ classes, attributes, tags, scopeToken, useClasses, scopeMode, componentTag }) {
    const css = generateRandomCss({ numRules: numRulesPerComponent, classes, attributes, tags })
    if (!scopeStyles) {
      return css
    }
    return (await scopeStyle({ css, token: scopeToken, useClasses, mode: scopeMode, componentTag }))
  }

  function createComponent({ scopeToken }) {
    const component = document.createElement(`my-component-${componentTagNameIndex++}`)

    let renderRoot = component
    if (useShadowDom) {
      const shadow = renderRoot.attachShadow({ mode: 'open' })
      renderRoot = shadow
    }

    let lastElm

    const tags = []
    const classes = []
    const attributes = []

    for (let i = 0; i < numElementsPerComponent; i++) {
      const tag = randomTag()
      tags.push(tag)
      const elm = document.createElement(tag)
      Object.assign(elm.style, {
        width: '1px',
        height: '1px',
        position: 'absolute',
        left: '0',
        right: '0'
      })

      for (let j = 0; j < numClassesPerElement; j++) {
        const clazz = randomString()
        classes.push(clazz)
        elm.classList.add(clazz)
      }

      for (let j = 0; j < numAttributesPerElement; j++) {
        const attribute = `data-${randomString()}`
        const attributeValue = randomString()
        attributes.push({ name: attribute, value: attributeValue })
        elm.setAttribute(attribute, attributeValue)
      }

      if (scopeToken) {
        if (useClasses) {
          elm.classList.add(scopeToken)
        } else {
          elm.setAttribute(scopeToken, '')
        }
      }

      // Chance of making the tree deeper or keeping it flat
      if (lastElm && randomCoin(0.75)) {
        lastElm.appendChild(elm)
      } else {
        renderRoot.appendChild(elm)
      }

      lastElm = elm
    }

    return { component, tags, classes, attributes }
  }

  const generateStylesheetPromises = []
  const newRoot = document.createElement('div')
  let lastComponent

  for (let i = 0; i < numComponents; i++) {
    const scopeToken = scopeStyles && `scope-${++scopeId}`
    const { component, tags, classes, attributes } = createComponent({ scopeToken })

    generateStylesheetPromises.push((async () => {
      const stylesheet = await generateRandomScopedCss({ classes, tags, attributes, scopeToken, numRules, useClasses, scopeMode, componentTag: component.tagName.toLowerCase() })

      if (useShadowDom) {
        return { shadowRoot: component.shadowRoot, stylesheet }
      } else {
        return stylesheet
      }
    })())

    // Chance of making the tree deeper or keeping it flat
    if (lastComponent && randomBool()) {
      (lastComponent.shadowRoot ?? lastComponent).appendChild(component)
    } else {
      newRoot.appendChild(component)
    }
    lastComponent = component
  }

  function flushStyles(stylesheetsToProcess) {
    if (useShadowDom) {
      // We probably could have appended stylesheets to the shadow roots earlier,
      // but just in case browsers have some magic to process the stylesheet as early as possible,
      // do it at the same time we would be injecting global styles
      for (const { shadowRoot, stylesheet } of stylesheetsToProcess) {
        shadowRoot.appendChild(createStyleTag(stylesheet))
      }
    } else {
      if (oneBigStyle) {
        injectGlobalCss(stylesheetsToProcess.join('\n'))
      } else {
        for (const stylesheet of stylesheetsToProcess) {
          injectGlobalCss(stylesheet)
        }
      }
    }
  }

  // Flush everything to the DOM in one go so we can measure accurately
  const stylesheetsToProcess = await Promise.all(generateStylesheetPromises)
  flushStyles(stylesheetsToProcess)
  container.appendChild(newRoot)

  performance.mark('start')
  // requestPostAnimationFrame polyfill
  requestAnimationFrame(() => {
    addEventListener('message', () => {
      performance.measure('total', 'start')
      display.innerHTML += `${performance.getEntriesByType('measure').slice(-1)[0].duration}ms\n`

      logChecksums()

    }, { once: true })
    postMessage('', '*')
  })
}

async function logChecksums() {
  // Make sure the HTML is the same every time
  console.log('html digest', await digestMessage(container.getInnerHTML ? container.getInnerHTML({ includeShadowRoots: true }) : container.innerHTML))
  console.log('style digest', await digestMessage($$('style').map(_ => _.textContent).join('\n')))
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const params = new URLSearchParams(location.search)

async function main() {
  if (params.get('auto') === 'true') {
    for (const input of $$('form input')) {
      const { id } = input
      const val = params.get(id)
      if (val) {
        if (input.type === 'number') {
          input.value = parseInt(val, 10)
        } else if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = val === 'true'
        }
      }
    }
    // Avoid measuring the style/layout of the form elements
    await new Promise(resolve => requestAnimationFrame(() => resolve()))
    await new Promise(resolve => requestAnimationFrame(() => resolve()))
    await doRunTest()
  }
}

main().catch(err => {
  console.error(err)
})