import * as postcss from 'postcss'
import { scopedPlugin } from './stylePluginScoped.js'

export async function scopeStyle(inputCss, token) {
  const plugins = [
    scopedPlugin(token)
  ]
  const { css } = await postcss.default(plugins).process(inputCss, {
    from: 'src/app.css',
    to: 'dist/app.css',
  })
  return css
}
