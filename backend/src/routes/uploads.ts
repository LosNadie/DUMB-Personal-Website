import { Router } from 'express'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import multer from 'multer'

import { requireAuth } from '../middleware/auth'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 80 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    const isImage = file.mimetype.startsWith('image/')
    const isVideo = file.mimetype.startsWith('video/')
    if (isImage || isVideo) {
      callback(null, true)
      return
    }
    callback(new Error('仅支持图片或视频文件。'))
  },
})

function ensureCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary 环境变量未配置。')
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

function uploadToCloudinary(fileBuffer: Buffer, options: { resourceType: 'image' | 'video'; folder: string }) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resourceType,
        folder: options.folder,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('上传失败。'))
          return
        }
        resolve(result)
      },
    )
    stream.end(fileBuffer)
  })
}

router.post('/upload', requireAuth, upload.single('file'), async (request, response) => {
  const file = request.file
  if (!file) {
    return response.status(400).json({ message: '未检测到上传文件。' })
  }

  ensureCloudinaryConfig()
  const isImage = file.mimetype.startsWith('image/')
  const isVideo = file.mimetype.startsWith('video/')
  if (!isImage && !isVideo) {
    return response.status(400).json({ message: '仅支持图片或视频文件。' })
  }

  const uploaded = await uploadToCloudinary(file.buffer, {
    resourceType: isVideo ? 'video' : 'image',
    folder: isVideo ? 'dumb/videos' : 'dumb/images',
  })

  return response.status(201).json({
    url: uploaded.secure_url,
    mimeType: file.mimetype,
    originalName: file.originalname,
  })
})

export default router
