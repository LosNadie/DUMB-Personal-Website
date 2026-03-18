import { ContentBlockType, type Prisma } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

import {
  mapBlockTypeEnumToValue,
  mapBlockTypeValueToEnum,
  mapCategoryEnumToValue,
  mapCategoryValueToEnum,
  parseJsonPayload,
} from '../lib/mappers'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(9),
})

const postBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal('image'),
    src: z.string().min(1),
    alt: z.string().default('图片'),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('video'),
    src: z.string().min(1),
    title: z.string().optional(),
  }),
  z.object({
    type: z.literal('audio'),
    src: z.string().min(1),
    title: z.string().optional(),
  }),
  z.object({
    type: z.literal('link'),
    url: z.string().url(),
    label: z.string().min(1),
    description: z.string().optional(),
  }),
])

const createPostSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/, 'slug 仅允许字母、数字和连字符。'),
  title: z.string().min(1),
  category: z.enum(['生活', '随笔', '工作']),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocks: z.array(postBlockSchema).min(1),
})

const updatePostSchema = createPostSchema

const router = Router()

function buildBlockValues(blocks: z.infer<typeof postBlockSchema>[]) {
  return blocks.map((block, index) => {
    let blockType = mapBlockTypeValueToEnum(block.type)
    let payload: Prisma.InputJsonValue

    switch (block.type) {
      case 'text':
        blockType = ContentBlockType.TEXT
        payload = { text: block.text }
        break
      case 'image':
        blockType = ContentBlockType.IMAGE
        payload = { src: block.src, alt: block.alt, caption: block.caption }
        break
      case 'video':
        blockType = ContentBlockType.VIDEO
        payload = { src: block.src, title: block.title }
        break
      case 'audio':
        blockType = ContentBlockType.AUDIO
        payload = { src: block.src, title: block.title }
        break
      case 'link':
        blockType = ContentBlockType.LINK
        payload = { url: block.url, label: block.label, description: block.description }
        break
    }

    return {
      type: blockType,
      order: index,
      payload,
    }
  })
}

router.get('/', async (request, response) => {
  const parsed = listQuerySchema.safeParse(request.query)
  if (!parsed.success) {
    return response.status(400).json({ message: '分页参数不正确。' })
  }

  const { page, pageSize } = parsed.data
  const skip = (page - 1) * pageSize

  const [total, items] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        publishedAt: true,
      },
      skip,
      take: pageSize,
    }),
  ])

  return response.json({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    items: items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      category: mapCategoryEnumToValue(item.category),
      publishedAt: item.publishedAt.toISOString().slice(0, 10),
    })),
  })
})

router.get('/admin', requireAuth, async (request, response) => {
  if (!request.userId) {
    return response.status(401).json({ message: '未授权。' })
  }

  const items = await prisma.post.findMany({
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      publishedAt: true,
    },
  })

  return response.json({
    items: items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      category: mapCategoryEnumToValue(item.category),
      publishedAt: item.publishedAt.toISOString().slice(0, 10),
    })),
  })
})

router.get('/slug/:slug', async (request, response) => {
  const slug = request.params.slug
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!post) {
    return response.status(404).json({ message: '内容不存在。' })
  }

  return response.json({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: mapCategoryEnumToValue(post.category),
    publishedAt: post.publishedAt.toISOString().slice(0, 10),
    blocks: post.blocks.map((block) => ({
      id: block.id,
      type: mapBlockTypeEnumToValue(block.type),
      ...parseJsonPayload(block.payload),
    })),
  })
})

router.post('/', requireAuth, async (request, response) => {
  const parsed = createPostSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({
      message: '发布参数不正确。',
      issues: parsed.error.flatten().fieldErrors,
    })
  }
  if (!request.userId) {
    return response.status(401).json({ message: '未授权。' })
  }

  const { slug, title, category, publishedAt, blocks } = parsed.data
  const existed = await prisma.post.findUnique({ where: { slug } })
  if (existed) {
    return response.status(409).json({ message: 'slug 已存在，请更换。' })
  }

  const blockValues: Prisma.PostBlockCreateWithoutPostInput[] = buildBlockValues(blocks)

  const created = await prisma.post.create({
    data: {
      slug,
      title,
      category: mapCategoryValueToEnum(category),
      publishedAt: new Date(`${publishedAt}T00:00:00.000Z`),
      authorId: request.userId,
      blocks: {
        create: blockValues,
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      publishedAt: true,
    },
  })

  return response.status(201).json({
    id: created.id,
    slug: created.slug,
    title: created.title,
    category: mapCategoryEnumToValue(created.category),
    publishedAt: created.publishedAt.toISOString().slice(0, 10),
  })
})

router.put('/id/:id', requireAuth, async (request, response) => {
  const parsed = updatePostSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({
      message: '更新参数不正确。',
      issues: parsed.error.flatten().fieldErrors,
    })
  }
  if (!request.userId) {
    return response.status(401).json({ message: '未授权。' })
  }

  const postId = String(request.params.id || '')
  if (!postId) {
    return response.status(400).json({ message: '文章 ID 不正确。' })
  }
  const current = await prisma.post.findUnique({ where: { id: postId } })
  if (!current) {
    return response.status(404).json({ message: '内容不存在或无权限。' })
  }

  const { slug, title, category, publishedAt, blocks } = parsed.data
  const slugConflict = await prisma.post.findFirst({
    where: {
      slug,
      NOT: { id: postId },
    },
    select: { id: true },
  })
  if (slugConflict) {
    return response.status(409).json({ message: 'slug 已存在，请更换。' })
  }

  const blockValues: Prisma.PostBlockCreateWithoutPostInput[] = buildBlockValues(blocks)

  const updated = await prisma.$transaction(async (tx) => {
    await tx.postBlock.deleteMany({ where: { postId } })
    return tx.post.update({
      where: { id: postId },
      data: {
        slug,
        title,
        category: mapCategoryValueToEnum(category),
        publishedAt: new Date(`${publishedAt}T00:00:00.000Z`),
        blocks: {
          create: blockValues,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        publishedAt: true,
      },
    })
  })

  return response.json({
    id: updated.id,
    slug: updated.slug,
    title: updated.title,
    category: mapCategoryEnumToValue(updated.category),
    publishedAt: updated.publishedAt.toISOString().slice(0, 10),
  })
})

router.delete('/id/:id', requireAuth, async (request, response) => {
  if (!request.userId) {
    return response.status(401).json({ message: '未授权。' })
  }

  const postId = String(request.params.id || '')
  if (!postId) {
    return response.status(400).json({ message: '文章 ID 不正确。' })
  }
  const current = await prisma.post.findUnique({ where: { id: postId } })
  if (!current) {
    return response.status(404).json({ message: '内容不存在或无权限。' })
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  return response.status(204).send()
})

export default router
