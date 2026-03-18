import { CONTENT_BLOCK_TYPE, POST_CATEGORY, type Post } from './types'

export const posts: Post[] = [
  {
    "id": "post-02",
    "slug": "02",
    "title": "AI视频生成哪家好",
    "category": "随笔",
    "publishedAt": "2026-03-18",
    "blocks": [
      {
        "id": "a9c60bb6-50b3-45d3-bc3e-43c419bccdd0",
        "type": "text",
        "text": "为了把这个背景弄好 我用了seedance2.0，killing 3.0，Google Flow，排除会员使用体验  对我这种普通用户来说 seedance2.0最慢至少6个小时，但是效果最好。killing对于简单的处理还不错但是相对快点也要2小时左右，而最快体验还不错的就是Google Flow了。"
      },
      {
        "id": "9ae7a80a-f04d-45fd-90e0-6bc342db90fc",
        "type": "image",
        "src": "https://www.behance.net/gallery/242086011/Snow-in-the-Polder/modules/1395721291",
        "alt": "图片"
      }
    ],
  },
  {
    id: 'post-DUMB',
    slug: 'DUMB',
    title: '历史第一天',
    category: POST_CATEGORY.WORK,
    publishedAt: '2026-03-18',
    blocks: [
      {
        id: 'block-DUMB-1',
        type: CONTENT_BLOCK_TYPE.TEXT,
        text: '我爱Cursor，我只用了5小时创建我的个人博客！',
      },
    ],
  },

]
