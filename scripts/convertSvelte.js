function gatherHtml() {
  const html = document.body.innerHTML
  let css = ''

  for (const styleSheet of document.styleSheets) {
    try {
      for (const rule of styleSheet.cssRules) {
        css += rule.cssText + '\n'
      }
    } catch (err) { /* ignore cross-origin errors */ }

  }

  return `
<!doctype html>
<html>
  <head>
    <style>${css}</style>
  </head>
  <body>${html}</body>
</html>
`.trim()
}