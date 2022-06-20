import PromiseWorker from 'promise-worker';

const poolSize = (navigator.hardwareConcurrency ?? 2) - 1

let currentWorker = 0
const workerUrl = new URL('./worker.js', import.meta.url)
const workerPool = new Array(poolSize).fill().map(() => new PromiseWorker(new Worker(workerUrl.toString())))

function nextWorker() {
  try {
    return workerPool[currentWorker]
  } finally {
    currentWorker++
    if (currentWorker === poolSize) {
      currentWorker = 0
    }
  }
}

export function scopeStyle({ css, token, useClasses }) {
  return nextWorker().postMessage({ css, token, useClasses })
}