import fs from 'fs'

const makeJson = browser => ({
  "$schema": "https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json",
  "sampleSize": 25,
  "timeout": 0,
  "benchmarks": [
    {
      "browser": {
        "name": browser
      },
      "measurement": [
        {
          "mode": "performance",
          "entryName": "total"
        }
      ],
      "expand": [
        {
          "name": "Scoping - classes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=false&useClasses=true"
        },
        {
          "name": "Scoping - attributes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=false&useClasses=false"
        },
        {
          "name": "Shadow DOM",
          "url": "http://localhost:3000/?auto=true&useShadowDom=true&scopeStyles=false"
        },
        {
          "name": "Unscoped",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&oneBigStyle=false"
        },
        {
          "name": "Scoping - classes - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=true"
        },
        {
          "name": "Scoping - attributes - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=false"
        },
        {
          "name": "Unscoped - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&oneBigStyle=true"
        }
      ]
    }
  ]
})

for (const browser of ['chrome', 'firefox', 'safari']) {
  const filename = `${browser}.tachometer.json`
  fs.writeFileSync(filename, JSON.stringify(makeJson(browser), null, 2), 'utf8')
}
