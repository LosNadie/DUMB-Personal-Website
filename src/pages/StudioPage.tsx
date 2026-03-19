import { Link } from 'react-router-dom'

function StudioPage() {
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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-10">
        <div className="liquid-glass rounded-2xl p-7 text-center">
          <h1
            className="text-3xl text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            Studio 发布入口
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            当前站点已切换为无后端发布方案。请使用 Decap CMS 在网页端直接管理文章，发布后会自动触发
            Vercel 构建上线。
          </p>
          <div className="mt-8 flex items-center justify-center gap-5">
            <a
              href="/admin"
              className="liquid-glass rounded-full px-5 py-2.5 text-sm text-foreground"
            >
              打开 CMS 后台
            </a>
            <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default StudioPage
