import 'dotenv/config'

import { ContentBlockType, PostCategory, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'dumb@user.com'
  const adminPassword = process.env.ADMIN_PASSWORD || '123456'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
    },
  })

  const existed = await prisma.post.findUnique({
    where: { slug: 'hello-flatland' },
  })

  if (existed) {
    return
  }

  await prisma.post.create({
    data: {
      slug: 'hello-flatland',
      title: '历史第一天',
      category: PostCategory.WORK,
      publishedAt: new Date('2026-03-18T00:00:00.000Z'),
      authorId: admin.id,
      blocks: {
        create: [
          {
            type: ContentBlockType.TEXT,
            order: 0,
            payload: {
              text: '我爱 Cursor，我只用了 5 小时创建我的个人博客！',
            },
          },
        ],
      },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
