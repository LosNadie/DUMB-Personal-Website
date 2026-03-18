import fs from 'node:fs'
import path from 'node:path'

import { Router } from 'express'
import multer from 'multer'

import { requireAuth } from '../middleware/auth'

const router = Router()

const uploadsRoot = path.resolve(process.cwd(), 'uploads')
const imageDir = path.join(uploadsRoot, 'images')
const videoDir = path.join(uploadsRoot, 'videos')

for (const target of [uploadsRoot, imageDir, videoDir]) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: (_request, file, callback) => {
    const isImage = file.mimetype.startsWith('image/')
    const isVideo = file.mimetype.startsWith('video/')
    if (isImage) {
      callback(null, imageDir)
      return
    }
    if (isVideo) {
      callback(null, videoDir)
      return
    }
    callback(new Error('仅支持图片或视频文件。'), imageDir)
  },
  filename: (_request, file, callback) => {
    const ext = path.extname(file.originalname) || ''
    const safeExt = ext.slice(0, 10)
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024,
  },
})

router.post('/upload', requireAuth, upload.single('file'), (request, response) => {
  const file = request.file
  if (!file) {
    return response.status(400).json({ message: '未检测到上传文件。' })
  }

  const relativePath = file.path.replace(uploadsRoot, '').replaceAll('\\', '/')
  const fileUrl = `${request.protocol}://${request.get('host')}/uploads${relativePath}`

  return response.status(201).json({
    url: fileUrl,
    mimeType: file.mimetype,
    originalName: file.originalname,
  })
})

export default router
