import fs from 'fs'
import path from 'path'
import median from 'median'

const files = {
  Chrome: 'chrome.results.json',
  Firefox: 'firefox.results.json',
  Safari: 'safari.results.json'
}

for (const [browserName, filename] of Object.entries(files)) {
  const localFilename = path.join('.', filename)
  if (!fs.existsSync(localFilename)) {
    continue
  }
  console.log(browserName + '\n')
  const json = JSON.parse(fs.readFileSync(localFilename, 'utf8'))

  for (const benchmark of json.benchmarks) {
    const { name: benchmarkName, samples } = benchmark
    console.log([benchmarkName, median(samples)].map(_ => JSON.stringify(_)).join(', '))
  }
}