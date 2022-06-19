import register from 'promise-worker/register.js'
import { scopedPlugin, setUseClasses } from './stylePluginScoped.js';
import * as postcss from 'postcss';

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

register(({ css, token, useClasses }) => {
  setUseClasses(useClasses)
  return scopeStyle(css, token)
})