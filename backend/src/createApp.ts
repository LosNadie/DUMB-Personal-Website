import 'dotenv/config'

import path from 'node:path'

import cors from 'cors'
import express from 'express'

import authRoutes from './routes/auth'
import postsRoutes from './routes/posts'
import uploadsRoutes from './routes/uploads'

type CreateAppOptions = {
  apiPrefix?: string
  enableStaticUploads?: boolean
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express()
  const prefix = options.apiPrefix || ''
  const enableStaticUploads = options.enableStaticUploads ?? true

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    }),
  )
  app.use(express.json({ limit: '2mb' }))

  if (enableStaticUploads) {
    app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))
  }

  app.get(`${prefix}/health`, (_request, response) => {
    response.json({ ok: true })
  })

  app.use(`${prefix}/auth`, authRoutes)
  app.use(`${prefix}/posts`, postsRoutes)
  app.use(`${prefix}/media`, uploadsRoutes)

  app.use(
    (error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
      void next
      console.error(error)
      response.status(500).json({ message: '服务异常，请稍后再试。' })
    },
  )

  return app
}
