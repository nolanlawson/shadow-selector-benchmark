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
          "name": "Scoping - classes - RHS",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=false&useClasses=true"
        },
        {
          "name": "Scoping - attributes - RHS",
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
          "name": "Scoping - classes - RHS - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=true"
        },
        {
          "name": "Scoping - attributes - RHS - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=false"
        },
        {
          "name": "Unscoped - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&oneBigStyle=true"
        },
        {
          "name": "Scoping - classes - full",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=false&useClasses=true&scopeModeEvery=true"
        },
        {
          "name": "Scoping - attributes - full",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=false&useClasses=false&scopeModeEvery=true"
        },
        {
          "name": "Scoping - tag prefix",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=false&useClasses=true&scopeModePrefix=true"
        },
        {
          "name": "Scoping - classes - full - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=true&scopeModeEvery=true"
        },
        {
          "name": "Scoping - attributes - full - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=false&scopeModeEvery=true"
        },
        {
          "name": "Scoping - tag prefix - concatenated",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&oneBigStyle=true&useClasses=true&scopeModePrefix=true"
        }
      ]
    }
  ]
})

for (const browser of ['chrome', 'firefox', 'safari']) {
  const filename = `${browser}.tachometer.json`
  fs.writeFileSync(filename, JSON.stringify(makeJson(browser), null, 2), 'utf8')
}
