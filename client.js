const css = 'div { color: red }'

async function scopeCss(css, token) {
  const url = '/scope?' + new URLSearchParams({ token }).toString()
  return (await (await fetch(url, {
    method: 'POST',
    body: css,
    headers: {
      'Content-Type': 'application/css'
    }
  })).text())
}

console.log(await scopeCss(css, 'baz'))