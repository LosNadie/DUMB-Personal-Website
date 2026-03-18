import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'

import { createApp } from '../backend/src/createApp'

const app = createApp({
  apiPrefix: '/api',
  enableStaticUploads: false,
})

const handler = serverless(app)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function vercelHandler(request: VercelRequest, response: VercelResponse) {
  await handler(request, response)
}
