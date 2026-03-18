import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { clearStudioAuthorization, isStudioAuthorized, saveStudioToken } from '@/lib/auth'
import {
  createPost,
  deletePostById,
  getPostDetail,
  listAdminPosts,
  login,
  uploadMedia,
  updatePostById,
  type PostCard,
} from '@/lib/api'
import {
  CONTENT_BLOCK_TYPE,
  POST_CATEGORY,
  type ContentBlock,
  type ContentBlockType,
  type PostCategory,
} from '@/content/types'

const CATEGORY_OPTIONS = [POST_CATEGORY.LIFE, POST_CATEGORY.ESSAY, POST_CATEGORY.WORK]
const BLOCK_TYPE_OPTIONS = [
  CONTENT_BLOCK_TYPE.TEXT,
  CONTENT_BLOCK_TYPE.IMAGE,
  CONTENT_BLOCK_TYPE.VIDEO,
  CONTENT_BLOCK_TYPE.AUDIO,
  CONTENT_BLOCK_TYPE.LINK,
]

type DraftBlock = {
  id: string
  type: ContentBlockType
  text: string
  src: string
  alt: string
  caption: string
  url: string
  label: string
  description: string
}

type NormalizedBlock =
  | {
      type: typeof CONTENT_BLOCK_TYPE.TEXT
      text: string
    }
  | {
      type: typeof CONTENT_BLOCK_TYPE.IMAGE
      src: string
      alt: string
      caption?: string
    }
  | {
      type: typeof CONTENT_BLOCK_TYPE.VIDEO
      src: string
      title?: string
    }
  | {
      type: typeof CONTENT_BLOCK_TYPE.AUDIO
      src: string
      title?: string
    }
  | {
      type: typeof CONTENT_BLOCK_TYPE.LINK
      url: string
      label: string
      description?: string
    }

function createDraftBlock(type: ContentBlockType = CONTENT_BLOCK_TYPE.TEXT): DraftBlock {
  return {
    id: crypto.randomUUID(),
    type,
    text: '',
    src: '',
    alt: '',
    caption: '',
    url: '',
    label: '',
    description: '',
  }
}

function convertBlockToDraft(block: ContentBlock): DraftBlock {
  const base = createDraftBlock(block.type)
  if (block.type === CONTENT_BLOCK_TYPE.TEXT) {
    return { ...base, text: block.text }
  }
  if (block.type === CONTENT_BLOCK_TYPE.IMAGE) {
    return {
      ...base,
      src: block.src,
      alt: block.alt,
      caption: block.caption || '',
    }
  }
  if (block.type === CONTENT_BLOCK_TYPE.VIDEO) {
    return {
      ...base,
      src: block.src,
      caption: block.title || '',
    }
  }
  if (block.type === CONTENT_BLOCK_TYPE.AUDIO) {
    return {
      ...base,
      src: block.src,
      caption: block.title || '',
    }
  }
  return {
    ...base,
    url: block.url,
    label: block.label,
    description: block.description || '',
  }
}

function StudioPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(isStudioAuthorized())
  const [managedPosts, setManagedPosts] = useState<PostCard[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null)
  const [errorText, setErrorText] = useState('')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState<PostCategory>(POST_CATEGORY.LIFE)
  const [publishedAt, setPublishedAt] = useState('')
  const [blocks, setBlocks] = useState<DraftBlock[]>([createDraftBlock()])
  const [successText, setSuccessText] = useState('')

  const canGenerate = useMemo(
    () => title.trim() !== '' && slug.trim() !== '' && publishedAt.trim() !== '',
    [publishedAt, slug, title],
  )

  const resetForm = () => {
    setEditingPostId(null)
    setTitle('')
    setSlug('')
    setCategory(POST_CATEGORY.LIFE)
    setPublishedAt('')
    setBlocks([createDraftBlock()])
  }

  const loadManagedPosts = async () => {
    try {
      setIsLoadingPosts(true)
      const response = await listAdminPosts()
      setManagedPosts(response.items)
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '加载文章列表失败。')
    } finally {
      setIsLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (!isAuthorized) {
      return
    }
    void loadManagedPosts()
  }, [isAuthorized])

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const result = await login(email.trim(), password.trim())
      saveStudioToken(result.token)
      setIsAuthorized(true)
      setErrorText('')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '登录失败，请重试。')
    }
  }

  const updateBlock = (id: string, patch: Partial<DraftBlock>) => {
    setBlocks((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  const removeBlock = (id: string) => {
    setBlocks((previous) => previous.filter((item) => item.id !== id))
  }

  const addBlock = () => {
    setBlocks((previous) => [...previous, createDraftBlock()])
  }

  const handlePublish = async () => {
    if (!canGenerate) {
      setErrorText('请先填写标题、slug、发布日期。')
      return
    }

    const normalizedBlocks = blocks
      .map((block) => {
        switch (block.type) {
          case CONTENT_BLOCK_TYPE.TEXT:
            if (!block.text.trim()) {
              return null
            }
            return {
              type: CONTENT_BLOCK_TYPE.TEXT,
              text: block.text.trim(),
            }

          case CONTENT_BLOCK_TYPE.IMAGE:
            if (!block.src.trim()) {
              return null
            }
            return {
              type: CONTENT_BLOCK_TYPE.IMAGE,
              src: block.src.trim(),
              alt: block.alt.trim() || '图片',
              caption: block.caption.trim() || undefined,
            }

          case CONTENT_BLOCK_TYPE.VIDEO:
            if (!block.src.trim()) {
              return null
            }
            return {
              type: CONTENT_BLOCK_TYPE.VIDEO,
              src: block.src.trim(),
              title: block.caption.trim() || undefined,
            }

          case CONTENT_BLOCK_TYPE.AUDIO:
            if (!block.src.trim()) {
              return null
            }
            return {
              type: CONTENT_BLOCK_TYPE.AUDIO,
              src: block.src.trim(),
              title: block.caption.trim() || undefined,
            }

          case CONTENT_BLOCK_TYPE.LINK:
            if (!block.url.trim() || !block.label.trim()) {
              return null
            }
            return {
              type: CONTENT_BLOCK_TYPE.LINK,
              url: block.url.trim(),
              label: block.label.trim(),
              description: block.description.trim() || undefined,
            }

          default:
            return null
        }
      })
      .filter((item): item is NormalizedBlock => item !== null)

    if (normalizedBlocks.length === 0) {
      setErrorText('请至少填写一个有效内容块。')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        slug: slug.trim(),
        title: title.trim(),
        category,
        publishedAt: publishedAt.trim(),
        blocks: normalizedBlocks,
      }

      if (editingPostId) {
        await updatePostById(editingPostId, payload)
        setSuccessText('更新成功。')
      } else {
        await createPost(payload)
        setSuccessText('发布成功。')
      }

      setErrorText('')
      resetForm()
      await loadManagedPosts()
    } catch (error) {
      setSuccessText('')
      setErrorText(error instanceof Error ? error.message : '发布失败，请重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (post: PostCard) => {
    try {
      setErrorText('')
      const detail = await getPostDetail(post.slug)
      setEditingPostId(post.id)
      setTitle(detail.title)
      setSlug(detail.slug)
      setCategory(detail.category as PostCategory)
      setPublishedAt(detail.publishedAt)
      setBlocks(
        detail.blocks.length > 0
          ? detail.blocks.map(convertBlockToDraft)
          : [createDraftBlock()],
      )
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '加载详情失败。')
    }
  }

  const handleDelete = async (post: PostCard) => {
    if (!window.confirm(`确认删除《${post.title}》吗？`)) {
      return
    }
    try {
      await deletePostById(post.id)
      setSuccessText('删除成功。')
      setErrorText('')
      if (editingPostId === post.id) {
        resetForm()
      }
      await loadManagedPosts()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '删除失败，请重试。')
    }
  }

  const handleLocalUpload = async (blockId: string, file: File) => {
    try {
      setUploadingBlockId(blockId)
      setErrorText('')
      const result = await uploadMedia(file)
      updateBlock(blockId, { src: result.url })
      setSuccessText('上传成功。')
    } catch (error) {
      setSuccessText('')
      setErrorText(error instanceof Error ? error.message : '上传失败。')
    } finally {
      setUploadingBlockId(null)
    }
  }

  const handleLogout = () => {
    clearStudioAuthorization()
    setIsAuthorized(false)
    setPassword('')
    setEmail('')
    setSuccessText('')
    setManagedPosts([])
    resetForm()
  }

  if (!isAuthorized) {
    return (
      <main className="relative min-h-screen bg-background text-foreground">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 z-0 h-full w-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
          <div className="liquid-glass rounded-2xl p-7">
            <h1
              className="text-3xl text-foreground"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              Studio 发布入口
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              输入管理员账号密码后才可直接发布内容到后端。
            </p>

            <form onSubmit={handleUnlock} className="mt-6 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="管理员邮箱"
                className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="输入密码"
                className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
              />
              <button type="submit" className="liquid-glass rounded-full px-5 py-2.5 text-sm">
                登录发布
              </button>
            </form>

            {errorText ? <p className="mt-4 text-sm text-foreground">{errorText}</p> : null}

            <Link to="/" className="mt-6 inline-block text-sm text-muted-foreground underline">
              返回首页
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between gap-4">
          <h1
            className="text-3xl text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            Studio 内容生成器
          </h1>
          <button type="button" onClick={handleLogout} className="text-sm text-muted-foreground">
            退出
          </button>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="标题"
            className="rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="slug（如 my-new-post）"
            className="rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as PostCategory)}
            className="rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
          >
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            type="date"
            className="rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
          />
        </section>

        <section className="mt-8 space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="liquid-glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{`内容块 ${index + 1}`}</p>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="text-xs text-muted-foreground"
                >
                  删除
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <select
                  value={block.type}
                  onChange={(event) =>
                    updateBlock(block.id, { type: event.target.value as ContentBlockType })
                  }
                  className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                >
                  {BLOCK_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {block.type === CONTENT_BLOCK_TYPE.TEXT ? (
                  <textarea
                    value={block.text}
                    onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                    placeholder="正文文本"
                    className="h-28 w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                  />
                ) : null}

                {block.type === CONTENT_BLOCK_TYPE.IMAGE ||
                block.type === CONTENT_BLOCK_TYPE.VIDEO ||
                block.type === CONTENT_BLOCK_TYPE.AUDIO ? (
                  <>
                    {block.type === CONTENT_BLOCK_TYPE.IMAGE ||
                    block.type === CONTENT_BLOCK_TYPE.VIDEO ? (
                      <div className="space-y-2">
                        <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-4 py-2 text-xs text-foreground">
                          {uploadingBlockId === block.id ? '上传中...' : '点击上传本地文件'}
                          <input
                            type="file"
                            accept={
                              block.type === CONTENT_BLOCK_TYPE.IMAGE
                                ? 'image/png,image/jpeg,image/jpg,image/webp,image/gif'
                                : 'video/mp4,video/webm,video/ogg'
                            }
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) {
                                void handleLocalUpload(block.id, file)
                              }
                              event.currentTarget.value = ''
                            }}
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">
                          也可手动填写外链（图片直链或可播放视频链接）。
                        </p>
                      </div>
                    ) : null}
                    <input
                      value={block.src}
                      onChange={(event) => updateBlock(block.id, { src: event.target.value })}
                      placeholder="资源地址（上传后自动填充，或手动粘贴链接）"
                      className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                    />
                    {block.type === CONTENT_BLOCK_TYPE.IMAGE ? (
                      <input
                        value={block.alt}
                        onChange={(event) => updateBlock(block.id, { alt: event.target.value })}
                        placeholder="图片 alt"
                        className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                      />
                    ) : null}
                    <input
                      value={block.caption}
                      onChange={(event) =>
                        updateBlock(block.id, { caption: event.target.value })
                      }
                      placeholder="说明（可选）"
                      className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                    />
                  </>
                ) : null}

                {block.type === CONTENT_BLOCK_TYPE.LINK ? (
                  <>
                    <input
                      value={block.url}
                      onChange={(event) => updateBlock(block.id, { url: event.target.value })}
                      placeholder="链接地址"
                      className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={block.label}
                      onChange={(event) => updateBlock(block.id, { label: event.target.value })}
                      placeholder="链接标题"
                      className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={block.description}
                      onChange={(event) =>
                        updateBlock(block.id, { description: event.target.value })
                      }
                      placeholder="描述（可选）"
                      className="w-full rounded-xl border border-border bg-white/20 px-4 py-3 text-sm outline-none"
                    />
                  </>
                ) : null}
              </div>
            </div>
          ))}

          <button type="button" onClick={addBlock} className="liquid-glass rounded-full px-5 py-2.5 text-sm">
            新增内容块
          </button>
        </section>

        <section className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={isSubmitting}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {editingPostId ? '更新内容' : '发布内容'}
          </button>
          {editingPostId ? (
            <button
              type="button"
              onClick={resetForm}
              className="ml-3 text-sm text-muted-foreground underline"
            >
              取消编辑
            </button>
          ) : null}
          {errorText ? <p className="text-sm text-foreground">{errorText}</p> : null}
          {successText ? <p className="text-sm text-foreground">{successText}</p> : null}
          <div className="flex gap-3">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground underline">
              返回首页
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg text-foreground">已发布内容</h2>
          {isLoadingPosts ? (
            <p className="mt-3 text-sm text-muted-foreground">加载中...</p>
          ) : managedPosts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">暂无内容。</p>
          ) : (
            <div className="mt-4 space-y-2">
              {managedPosts.map((post) => (
                <div
                  key={post.id}
                  className="liquid-glass flex items-center justify-between rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.publishedAt} · {post.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleEdit(post)}
                      className="text-xs text-foreground"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(post)}
                      className="text-xs text-muted-foreground"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default StudioPage
