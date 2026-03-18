import 'dotenv/config'

import path from 'node:path'

import cors from 'cors'
import express from 'express'

import authRoutes from './routes/auth'
import postsRoutes from './routes/posts'
import uploadsRoutes from './routes/uploads'

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.use('/auth', authRoutes)
app.use('/posts', postsRoutes)
app.use('/media', uploadsRoutes)

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  void next
  console.error(error)
  response.status(500).json({ message: '服务异常，请稍后再试。' })
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
