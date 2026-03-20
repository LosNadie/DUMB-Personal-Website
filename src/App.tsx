import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { listPosts, type PostCard } from '@/lib/content'

const FLATLAND_PAGE_SIZE = 4
const FLATLAND_TRANSITION_MS = 900

const SECTION_KEY = {
  HOME: 'home',
  FLATLAND: 'flatland',
  ABOUT: 'about',
} as const

const ABOUT_PARAGRAPHS = [
  '大家好，我是一个热爱生活、兼顾理性与兴趣的人。平时会关注 AI 相关内容，对技术、设计和职业发展有自己的思考，也在认真规划自己的学业与未来方向。',
  '生活里我是个爱听音乐、喜欢二次元、爱玩游戏的人，偶尔会关注赛事，也很在意和身边人的相处与情绪。如果想更了解我可以看我的社交媒体。',
]

type SocialLink = {
  label: string
  href: string
  iconUrl: string
}

type SectionKey = (typeof SECTION_KEY)[keyof typeof SECTION_KEY]

const aboutSocialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/LosNadie/',
    iconUrl: 'https://cdn.simpleicons.org/github/111827',
  },
  {
    label: '微博',
    href: 'https://weibo.com/u/5193207682',
    iconUrl: 'https://cdn.simpleicons.org/sinaweibo/111827',
  },
  {
    label: 'B站',
    href: 'https://b23.tv/rI1olZP',
    iconUrl: 'https://cdn.simpleicons.org/bilibili/111827',
  },
]

function chunkCards(cards: PostCard[], size: number): PostCard[][] {
  return cards.reduce<PostCard[][]>((accumulator, card, index) => {
    const pageIndex = Math.floor(index / size)
    if (!accumulator[pageIndex]) {
      accumulator[pageIndex] = []
    }
    accumulator[pageIndex].push(card)
    return accumulator
  }, [])
}

function App() {
  const [activePage, setActivePage] = useState(1)
  const [leavingPage, setLeavingPage] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<SectionKey>(SECTION_KEY.HOME)
  const [cards, setCards] = useState<PostCard[]>([])
  const [listError, setListError] = useState('')
  const [isListLoading, setIsListLoading] = useState(true)
  const timeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const flatlandPages = useMemo(() => chunkCards(cards, FLATLAND_PAGE_SIZE), [cards])

  const currentCards = flatlandPages[activePage - 1] ?? []
  const previousCards = leavingPage ? flatlandPages[leavingPage - 1] ?? [] : []

  const handlePageChange = (page: number) => {
    if (page === activePage) {
      return
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }

    setLeavingPage(activePage)
    setActivePage(page)
    timeoutRef.current = window.setTimeout(() => {
      setLeavingPage(null)
      timeoutRef.current = null
    }, FLATLAND_TRANSITION_MS)
  }

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setIsListLoading(true)
        setListError('')
        const firstPage = await listPosts(1, FLATLAND_PAGE_SIZE)
        let allCards = [...firstPage.items]
        for (let page = 2; page <= firstPage.totalPages; page += 1) {
          const response = await listPosts(page, FLATLAND_PAGE_SIZE)
          allCards = [...allCards, ...response.items]
        }
        setCards(allCards)
      } catch (error) {
        setListError(error instanceof Error ? error.message : '获取卡片失败。')
      } finally {
        setIsListLoading(false)
      }
    }

    fetchAllPosts()
  }, [])

  useEffect(() => {
    if (flatlandPages.length === 0) {
      setActivePage(1)
      return
    }
    if (activePage > flatlandPages.length) {
      setActivePage(flatlandPages.length)
    }
  }, [activePage, flatlandPages.length])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const updateActiveSection = () => {
      const sections = document.querySelectorAll<HTMLElement>('[data-page-section]')
      if (sections.length === 0) {
        return
      }

      const viewportCenter = window.innerHeight / 2
      let nearestKey: SectionKey = SECTION_KEY.HOME
      let nearestDistance = Number.POSITIVE_INFINITY

      sections.forEach((section) => {
        const key = section.dataset.pageSection as SectionKey | undefined
        if (!key) {
          return
        }
        const rect = section.getBoundingClientRect()
        const sectionCenter = rect.top + rect.height / 2
        const distance = Math.abs(sectionCenter - viewportCenter)

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestKey = key
        }
      })

      setActiveSection((previous) => (previous === nearestKey ? previous : nearestKey))
    }

    const onScrollOrResize = () => {
      if (rafRef.current !== null) {
        return
      }
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        updateActiveSection()
      })
    }

    updateActiveSection()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [])

  const getSectionTransitionClassName = (key: SectionKey) =>
    [
      'page-section-transition',
      activeSection === key ? 'page-section-visible' : 'page-section-muted',
    ].join(' ')

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

      <div className="relative z-10">
        <section
          data-page-section={SECTION_KEY.HOME}
          className={`min-h-screen px-6 ${getSectionTransitionClassName(SECTION_KEY.HOME)}`}
        >
          <nav className="mx-auto flex w-full max-w-7xl items-center justify-center px-8 py-6">
            <a
              href="#"
              className="text-3xl tracking-tight text-foreground"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              DUMB
            </a>
          </nav>

          <div className="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center text-center">
            <h1
              className="max-w-7xl text-5xl leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              时间落下的我
            </h1>
          </div>
        </section>

        <section
          id="flatland"
          data-page-section={SECTION_KEY.FLATLAND}
          className={`mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 ${getSectionTransitionClassName(
            SECTION_KEY.FLATLAND,
          )}`}
        >
          <p
            className="text-center text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            Flatland
          </p>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative min-h-[760px] w-full">
              {leavingPage !== null && (
                <div className="flatland-layer flatland-layer-leave pointer-events-none">
                  <div className="mx-auto grid w-full max-w-6xl place-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {previousCards.map((card) => (
                      <article
                        key={`leaving-${card.id}`}
                        className="liquid-glass w-full max-w-sm rounded-2xl p-5 text-center"
                      >
                        <p className="text-xs text-muted-foreground">{card.publishedAt}</p>
                        <h3 className="mt-3 text-base text-foreground">{card.title}</h3>
                        <p className="mt-3 text-sm text-muted-foreground">{card.category}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={[
                  'flatland-layer',
                  leavingPage !== null ? 'flatland-layer-enter' : 'flatland-layer-static',
                ].join(' ')}
              >
                <div className="mx-auto grid w-full max-w-6xl place-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {isListLoading ? (
                    <p className="col-span-full text-sm text-muted-foreground">加载中...</p>
                  ) : listError ? (
                    <p className="col-span-full text-sm text-foreground">{listError}</p>
                  ) : currentCards.length === 0 ? (
                    <p className="col-span-full text-sm text-muted-foreground">还没有内容。</p>
                  ) : (
                    currentCards.map((card) => (
                      <Link
                        key={card.id}
                        to={`/post/${card.slug}`}
                        className="liquid-glass w-full max-w-sm rounded-2xl p-5 text-center"
                      >
                        <p className="text-xs text-muted-foreground">{card.publishedAt}</p>
                        <h3 className="mt-3 text-base text-foreground">{card.title}</h3>
                        <p className="mt-3 text-sm text-muted-foreground">{card.category}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pb-4 text-sm">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, activePage - 1))}
              disabled={activePage <= 1}
              className="px-2 py-1 text-muted-foreground disabled:opacity-40"
              aria-label="上一页"
            >
              {'<'}
            </button>
            <span className="text-foreground">{`${activePage} / ${Math.max(1, flatlandPages.length)}`}</span>
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(flatlandPages.length, activePage + 1))}
              disabled={activePage >= flatlandPages.length}
              className="px-2 py-1 text-muted-foreground disabled:opacity-40"
              aria-label="下一页"
            >
              {'>'}
            </button>
          </div>
        </section>

        <section
          id="about"
          data-page-section={SECTION_KEY.ABOUT}
          className={`mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 ${getSectionTransitionClassName(
            SECTION_KEY.ABOUT,
          )}`}
        >
          <p
            className="text-center text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
          >
            About
          </p>

          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-3xl space-y-5 text-center">
              {ABOUT_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-foreground sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 pb-4">
            {aboutSocialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="flex h-10 w-10 items-center justify-center"
              >
                <img src={link.iconUrl} alt={link.label} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
