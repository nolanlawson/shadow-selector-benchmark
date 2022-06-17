import PromiseWorker from 'promise-worker'

const worker = new Worker('/dist/worker.js')
const promiseWorker = new PromiseWorker(worker)

function scopeStyle(css, token) {
  return promiseWorker.postMessage({ css, token })
}

console.log(await scopeStyle('div { color: blue; }', 'foo'))