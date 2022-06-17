import postcss from 'postcss'
import stylePluginScoped from './stylePluginScoped.js'

const style = `
.foo .bar {
  color: red;
}

.bazzy.barry {
  color: yellow;
}
.baz {
  color: blue;
}
* {
  background: red;
}
`

async function main() {
  const plugins = [
    stylePluginScoped('my-scope-token')
  ]
  const { css } = await postcss(plugins).process(style, {
    from: 'src/app.css',
    to: 'dist/app.css',
  })
  console.log(css)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})