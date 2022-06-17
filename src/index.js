import PromiseWorker from 'promise-worker'
import afterframe from 'afterframe'
import {randomNumber, randomString, randomColor, randomTag, randomBool} from './rando.js';

const worker = new PromiseWorker(new Worker('/dist/worker.js'))

function scopeStyle(css, token) {
  return worker.postMessage({ css, token })
}

const $ = document.querySelector.bind(document)
const $$ = _ => [...document.querySelectorAll(_)]

const goButton = $('#go')
const useShadowDomInput = $('#useShadowDom')
const numRulesInput = $('#numRules')
const numComponentsInput = $('#numComponents')
const numElementsInput = $('#numElements')
const numClassesInput = $('#numClasses')
const numAttributesInput = $('#numAttributes')
const container = $('#container')
const display = $('#display')

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

async function doRunTest() {
  const numComponents = parseInt(numComponentsInput.value, 10)
  const numElementsPerComponent = parseInt(numElementsInput.value, 10)
  const numClassesPerElement = parseInt(numClassesInput.value, 10)
  const numAttributesPerElement = parseInt(numAttributesInput.value, 10)
  const numRulesPerComponent = parseInt(numRulesInput.value, 10)
  const useShadowDom = useShadowDomInput.checked

  container.innerHTML = ''
  $$('style').forEach(style => style.remove())

  function createComponent() {
    const root = document.createElement('my-component')

    let lastElm

    const numElements = randomNumber(1, numElementsPerComponent * 2)

    for (let i = 0; i < numElements; i++) {
      const tag = randomTag()
      const elm = document.createElement(tag)
      elm.textContent = randomColor()

      const numClasses = randomNumber(0, (numClassesPerElement * 2) - 1)
      const numAttributes = randomNumber(0, (numAttributesPerElement * 2) - 1)

      for (let j = 0; j < numClasses; j++) {
        elm.classList.add(randomString())
      }

      for (let j = 0; j < numAttributes; j++) {
        elm.setAttribute(`data-${randomString()}`, randomString())
      }

      // 50/50 chance of making the tree deeper or keeping it flat
      if (lastElm && randomBool()) {
        lastElm.appendChild(elm)
      } else {
        root.appendChild(elm)
      }

      lastElm = elm
    }

    return root

  }

  let lastComponent
  for (let i = 0; i < numComponents; i++) {
    const component = createComponent()

    // 50/50 chance of making the tree deeper or keeping it flat
    if (lastComponent && randomBool()) {
      lastComponent.appendChild(component)
    } else {
      container.appendChild(component)
    }
    lastComponent = component
  }
}