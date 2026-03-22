import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import ShaderBackground from '@/components/ShaderBackground'
import { getPostDetail, type PostDetail } from '@/lib/content'

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

    void fetchPost()
  }, [slug])

  if (isLoading) {
    return (
      <main className="relative min-h-screen bg-background text-foreground">
        <ShaderBackground />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="relative min-h-screen bg-background text-foreground">
        <ShaderBackground />
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
      <ShaderBackground />

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
          <article className="liquid-glass rounded-2xl p-6 sm:p-7">
            <div className="prose prose-invert max-w-none text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: (props) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-1 underline-offset-4"
                    />
                  ),
                  img: (props) => <img {...props} className="my-4 w-full rounded-2xl" alt={props.alt || '图片'} />,
                  p: (props) => <p {...props} className="whitespace-pre-wrap" />,
                  hr: () => <hr className="my-8 border-0 border-t border-border/80" />,
                  blockquote: (props) => (
                    <blockquote
                      {...props}
                      className="my-6 rounded-r-xl border-l-4 border-border/90 bg-white/30 px-4 py-3 text-muted-foreground"
                    />
                  ),
                  pre: (props) => (
                    <pre
                      {...props}
                      className="my-6 overflow-x-auto rounded-xl border border-border/80 bg-black/70 p-4 text-sm leading-relaxed text-slate-100"
                    />
                  ),
                  code: ({ children, className, ...props }) => {
                    const content = String(children).replace(/\n$/, '')
                    const isCodeBlock = (className || '').includes('language-') || content.includes('\n')
                    if (isCodeBlock) {
                      return (
                        <code {...props} className={`${className || ''} font-mono text-[0.92em]`}>
                          {content}
                        </code>
                      )
                    }
                    return (
                      <code
                        {...props}
                        className="rounded-md border border-border/70 bg-white/45 px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
                      >
                        {content}
                      </code>
                    )
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
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
