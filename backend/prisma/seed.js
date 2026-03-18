"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dumb.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'dumb-admin-2026';
    const passwordHash = await bcryptjs_1.default.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
        },
        create: {
            email: adminEmail,
            passwordHash,
        },
    });
    const existed = await prisma.post.findUnique({
        where: { slug: 'hello-flatland' },
    });
    if (existed) {
        return;
    }
    await prisma.post.create({
        data: {
            slug: 'hello-flatland',
            title: '历史第一天',
            category: client_1.PostCategory.WORK,
            publishedAt: new Date('2026-03-18T00:00:00.000Z'),
            authorId: admin.id,
            blocks: {
                create: [
                    {
                        type: client_1.ContentBlockType.TEXT,
                        order: 0,
                        payload: {
                            text: '我爱 Cursor，我只用了 5 小时创建我的个人博客！',
                        },
                    },
                ],
            },
        },
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
