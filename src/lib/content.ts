type PostCategory = '生活' | '随笔' | '工作'

export type PostCard = {
  id: string
  slug: string
  title: string
  category: PostCategory
  publishedAt: string
}

export type PostDetail = PostCard & {
  content: string
}

type ListPostsResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  items: PostCard[]
}

type FrontmatterRecord = Record<string, string>

const VALID_CATEGORY = new Set<PostCategory>(['生活', '随笔', '工作'])

const markdownModules = import.meta.glob('/src/content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {} as FrontmatterRecord, body: raw.trim() }
  }

  const frontmatterBlock = match[1]
  const body = match[2].trim()
  const frontmatter = frontmatterBlock.split('\n').reduce<FrontmatterRecord>((accumulator, line) => {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex < 1) {
      return accumulator
    }
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, '$1')
    accumulator[key] = value
    return accumulator
  }, {})

  return { frontmatter, body }
}

function normalizeCategory(category: string): PostCategory {
  if (VALID_CATEGORY.has(category as PostCategory)) {
    return category as PostCategory
  }
  return '随笔'
}

function readAllPosts(): PostDetail[] {
  const allPosts = Object.entries(markdownModules).map(([filePath, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const fallbackSlug = filePath.split('/').pop()?.replace('.md', '') || crypto.randomUUID()
    const slug = frontmatter.slug || fallbackSlug
    const title = frontmatter.title || slug
    const category = normalizeCategory(frontmatter.category || '')
    const publishedAt = frontmatter.publishedAt || '1970-01-01'

    return {
      id: slug,
      slug,
      title,
      category,
      publishedAt,
      content: body,
    }
  })

  return allPosts.sort((left, right) => {
    if (left.publishedAt === right.publishedAt) {
      return left.title.localeCompare(right.title, 'zh-CN')
    }
    return right.publishedAt.localeCompare(left.publishedAt)
  })
}

export async function listPosts(page: number, pageSize: number): Promise<ListPostsResponse> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 9
  const allPosts = readAllPosts()
  const total = allPosts.length
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))
  const currentPage = Math.min(safePage, totalPages)
  const start = (currentPage - 1) * safePageSize
  const end = start + safePageSize

  return {
    page: currentPage,
    pageSize: safePageSize,
    total,
    totalPages,
    items: allPosts.slice(start, end).map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category,
      publishedAt: post.publishedAt,
    })),
  }
}

export async function getPostDetail(slug: string): Promise<PostDetail> {
  const allPosts = readAllPosts()
  const target = allPosts.find((post) => post.slug === slug)
  if (!target) {
    throw new Error('内容不存在。')
  }
  return target
}
