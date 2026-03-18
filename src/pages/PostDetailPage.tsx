import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getPostDetail, type PostDetail } from '@/lib/api'
import { CONTENT_BLOCK_TYPE, type ContentBlock } from '@/content/types'

function toEmbeddableVideoUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (parsed.hostname.includes('player.bilibili.com')) {
      return url
    }
    return null
  } catch {
    return null
  }
}

function isDirectVideo(url: string) {
  return /^data:video\//i.test(url) || /\.(mp4|webm|ogg)(\?|#|$)/i.test(url)
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case CONTENT_BLOCK_TYPE.TEXT:
      return (
        <p className="text-base leading-relaxed text-foreground sm:text-lg">
          {block.text}
        </p>
      )

    case CONTENT_BLOCK_TYPE.IMAGE:
      return (
        <figure className="space-y-3">
          <img src={block.src} alt={block.alt} className="w-full rounded-2xl object-cover" />
          <a
            href={block.src}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            打开图片原链接
          </a>
          {block.caption ? (
            <figcaption className="text-sm text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      )

    case CONTENT_BLOCK_TYPE.VIDEO:
      {
      if (isDirectVideo(block.src)) {
        return (
          <div className="space-y-3">
            <video controls className="w-full rounded-2xl">
              <source src={block.src} type="video/mp4" />
            </video>
            <a
              href={block.src}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              打开视频原链接
            </a>
            {block.title ? (
              <p className="text-sm text-muted-foreground">{block.title}</p>
            ) : null}
          </div>
        )
      }

      const embedUrl = toEmbeddableVideoUrl(block.src)
      if (embedUrl) {
        return (
          <div className="space-y-3">
            <iframe
              src={embedUrl}
              title={block.title || 'video'}
              className="aspect-video w-full rounded-2xl"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            <a
              href={block.src}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              打开视频原链接
            </a>
            {block.title ? (
              <p className="text-sm text-muted-foreground">{block.title}</p>
            ) : null}
          </div>
        )
      }

      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            当前视频链接不是可直接播放地址，请使用 mp4 直链或可嵌入视频链接。
          </p>
          <a
            href={block.src}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground underline underline-offset-4"
          >
            打开视频链接
          </a>
          {block.title ? (
            <p className="text-sm text-muted-foreground">{block.title}</p>
          ) : null}
        </div>
      )
      }

    case CONTENT_BLOCK_TYPE.AUDIO:
      return (
        <div className="space-y-3">
          <audio controls className="w-full">
            <source src={block.src} type="audio/mpeg" />
          </audio>
          {block.title ? (
            <p className="text-sm text-muted-foreground">{block.title}</p>
          ) : null}
        </div>
      )

    case CONTENT_BLOCK_TYPE.LINK:
      return (
        <div className="space-y-2">
          <a
            href={block.url}
            target="_blank"
            rel="noreferrer"
            className="text-base text-foreground underline underline-offset-4"
          >
            {block.label}
          </a>
          {block.description ? (
            <p className="text-sm text-muted-foreground">{block.description}</p>
          ) : null}
        </div>
      )

    default:
      return null
  }
}

function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (!slug) {
      setPost(null)
      setErrorText('内容不存在')
      setIsLoading(false)
      return
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true)
        setErrorText('')
        const detail = await getPostDetail(slug)
        setPost(detail)
      } catch (error) {
        setPost(null)
        setErrorText(error instanceof Error ? error.message : '内容不存在')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  if (isLoading) {
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
        <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </main>
    )
  }

  if (!post) {
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
        <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
          <h1
            className="text-4xl text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            {errorText || '内容不存在'}
          </h1>
          <Link to="/" className="mt-6 text-sm text-foreground underline underline-offset-4">
            返回首页
          </Link>
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

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        <header className="space-y-3 pb-10 text-center">
          <h1
            className="text-4xl text-foreground sm:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {post.publishedAt} · {post.category}
          </p>
        </header>

        <section className="space-y-8 pb-12">
          {post.blocks.map((block) => (
            <article key={block.id} className="liquid-glass rounded-2xl p-6 sm:p-7">
              {renderBlock(block)}
            </article>
          ))}
        </section>

        <footer className="pb-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
            返回 Flatland
          </Link>
        </footer>
      </div>
    </main>
  )
}

export default PostDetailPage
