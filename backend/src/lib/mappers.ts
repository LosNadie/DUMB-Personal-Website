import { ContentBlockType, PostCategory, type Prisma } from '@prisma/client'

const CATEGORY_LABEL = {
  [PostCategory.LIFE]: '生活',
  [PostCategory.ESSAY]: '随笔',
  [PostCategory.WORK]: '工作',
} as const

const CATEGORY_VALUE_TO_ENUM = {
  生活: PostCategory.LIFE,
  随笔: PostCategory.ESSAY,
  工作: PostCategory.WORK,
} as const

const BLOCK_TYPE_LABEL = {
  [ContentBlockType.TEXT]: 'text',
  [ContentBlockType.IMAGE]: 'image',
  [ContentBlockType.VIDEO]: 'video',
  [ContentBlockType.AUDIO]: 'audio',
  [ContentBlockType.LINK]: 'link',
} as const

const BLOCK_TYPE_VALUE_TO_ENUM = {
  text: ContentBlockType.TEXT,
  image: ContentBlockType.IMAGE,
  video: ContentBlockType.VIDEO,
  audio: ContentBlockType.AUDIO,
  link: ContentBlockType.LINK,
} as const

export type CategoryValue = keyof typeof CATEGORY_VALUE_TO_ENUM
export type BlockTypeValue = keyof typeof BLOCK_TYPE_VALUE_TO_ENUM

export function mapCategoryEnumToValue(category: PostCategory) {
  return CATEGORY_LABEL[category]
}

export function mapCategoryValueToEnum(category: CategoryValue) {
  return CATEGORY_VALUE_TO_ENUM[category]
}

export function mapBlockTypeEnumToValue(type: ContentBlockType) {
  return BLOCK_TYPE_LABEL[type]
}

export function mapBlockTypeValueToEnum(type: BlockTypeValue) {
  return BLOCK_TYPE_VALUE_TO_ENUM[type]
}

export function parseJsonPayload(payload: Prisma.JsonValue) {
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as Record<string, unknown>
  }
  return {}
}
