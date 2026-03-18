import type { ContentBlock } from '@/content/types'
import { getStudioToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export type PostCard = {
  id: string
  slug: string
  title: string
  category: string
  publishedAt: string
}

export type PostDetail = {
  id: string
  slug: string
  title: string
  category: string
  publishedAt: string
  blocks: ContentBlock[]
}

export type ListPostsResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  items: PostCard[]
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  withAuth?: boolean
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (options.withAuth) {
    const token = getStudioToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null
    throw new Error(errorPayload?.message || `请求失败（${response.status}）`)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

export async function login(email: string, password: string) {
  return requestJson<{ token: string; user: { id: string; email: string } }>(
    '/auth/login',
    {
      method: 'POST',
      body: { email, password },
    },
  )
}

export async function listPosts(page: number, pageSize: number) {
  return requestJson<ListPostsResponse>(`/posts?page=${page}&pageSize=${pageSize}`)
}

export async function listAdminPosts() {
  return requestJson<{ items: PostCard[] }>('/posts/admin', { withAuth: true })
}

export async function getPostDetail(slug: string) {
  return requestJson<PostDetail>(`/posts/slug/${slug}`)
}

export type CreatePostPayload = {
  slug: string
  title: string
  category: '生活' | '随笔' | '工作'
  publishedAt: string
  blocks: unknown[]
}

export async function createPost(payload: CreatePostPayload) {
  return requestJson<PostCard>('/posts', {
    method: 'POST',
    body: payload,
    withAuth: true,
  })
}

export async function updatePostById(postId: string, payload: CreatePostPayload) {
  return requestJson<PostCard>(`/posts/id/${postId}`, {
    method: 'PUT',
    body: payload,
    withAuth: true,
  })
}

export async function deletePostById(postId: string) {
  return requestJson<null>(`/posts/id/${postId}`, {
    method: 'DELETE',
    withAuth: true,
  })
}

export async function uploadMedia(file: File) {
  const token = getStudioToken()
  if (!token) {
    throw new Error('未登录，无法上传。')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null
    throw new Error(errorPayload?.message || `上传失败（${response.status}）`)
  }

  return (await response.json()) as {
    url: string
    mimeType: string
    originalName: string
  }
}
