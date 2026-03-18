export const POST_CATEGORY = {
  LIFE: '生活',
  ESSAY: '随笔',
  WORK: '工作',
} as const

export type PostCategory = (typeof POST_CATEGORY)[keyof typeof POST_CATEGORY]

export const CONTENT_BLOCK_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  LINK: 'link',
} as const

export type ContentBlockType =
  (typeof CONTENT_BLOCK_TYPE)[keyof typeof CONTENT_BLOCK_TYPE]

type BlockBase = {
  id: string
  type: ContentBlockType
}

export type TextBlock = BlockBase & {
  type: typeof CONTENT_BLOCK_TYPE.TEXT
  text: string
}

export type ImageBlock = BlockBase & {
  type: typeof CONTENT_BLOCK_TYPE.IMAGE
  src: string
  alt: string
  caption?: string
}

export type VideoBlock = BlockBase & {
  type: typeof CONTENT_BLOCK_TYPE.VIDEO
  src: string
  title?: string
}

export type AudioBlock = BlockBase & {
  type: typeof CONTENT_BLOCK_TYPE.AUDIO
  src: string
  title?: string
}

export type LinkBlock = BlockBase & {
  type: typeof CONTENT_BLOCK_TYPE.LINK
  url: string
  label: string
  description?: string
}

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | LinkBlock

export type Post = {
  id: string
  slug: string
  title: string
  category: PostCategory
  publishedAt: string
  blocks: ContentBlock[]
}
