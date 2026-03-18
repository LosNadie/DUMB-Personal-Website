import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

type JwtPayload = {
  sub: string
}

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dumb-backend-dev-secret'
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null

  if (!token) {
    return response.status(401).json({ message: '未登录或令牌缺失。' })
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload
    request.userId = decoded.sub
    return next()
  } catch {
    return response.status(401).json({ message: '令牌无效或已过期。' })
  }
}

export function signAccessToken(userId: string) {
  return jwt.sign({}, getJwtSecret(), {
    subject: userId,
    expiresIn: '7d',
  })
}
