import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { signAccessToken } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确。'),
  password: z.string().min(1, '密码不能为空。'),
})

const router = Router()

router.post('/login', async (request, response) => {
  const parsed = loginSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({
      message: '参数校验失败。',
      issues: parsed.error.flatten().fieldErrors,
    })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return response.status(401).json({ message: '账号或密码错误。' })
  }

  const isMatched = await bcrypt.compare(password, user.passwordHash)
  if (!isMatched) {
    return response.status(401).json({ message: '账号或密码错误。' })
  }

  const token = signAccessToken(user.id)
  return response.json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  })
})

export default router
