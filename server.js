import express from 'express'
import {scopeStyle} from './src/scopeStyle.js';
import bodyParser from 'body-parser'

const app = express()
const PORT = process.env.PORT ?? 3000

const textParser = bodyParser.text({ type: 'application/css' })
app.post('/scope', textParser, async (req, res) => {
  const css = req?.body ?? 'css'
  const token = req?.query?.token ?? 'token'

  try {
    const scoped = await scopeStyle(css, token)

    res.type('application/css').send(scoped)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal error')
  }
})

app.use('/', express.static('./'))

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})