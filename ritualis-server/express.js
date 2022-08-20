import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import path from 'path'

import sessionRoutes from './routes/api/sessions/session.js'

function initExpress () {
  const app = express()

  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:49161'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
  }))
  app.use(morgan('tiny'))
  app.use(bodyParser.json())
  app.use(cookieParser())

  app.use('/api/session', sessionRoutes)

  app.set({
    'Content-Security-Policy':
      "default-src 'self';" +
      "script-src 'self' https://polyfill.io https://unpkg.com;" +
      "img-src 'self';" +
      "font-src 'self' data: https://fonts.gstatic.com https://www.slant.co https://use.fontawesome.com;" +
      "style-src 'self' https://fonts.googleapis.com https://unpkg.com;" +
      "frame-ancestors 'none';"
  })

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(path.resolve(), 'ritualis-frontend/dist')
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, '/index.html'))
    })
  }

  return app
}

export { initExpress }
