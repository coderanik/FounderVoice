'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Bell, Check, ChevronDown, FileCheck2, FileText, GitBranch, ShieldCheck, X, Zap } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MentoringIcon, MessageQuestionIcon, Mic01Icon, Presentation01Icon, Structure01Icon, TaskDone01Icon } from '@hugeicons/core-free-icons'
import CardNav, { type CardNavItem } from '../components/CardNav'
import BellToggle from '../components/BellToggle'

const problems = [
  { title: 'The pitch loses the point', copy: 'Problem, insight, why now, and why you get flattened until your actual words are gone.', Icon: FileText },
  { title: 'The model runs ahead', copy: 'The spreadsheet looks finished before you have confirmed the numbers in it.', Icon: ShieldCheck },
  { title: 'Nothing matches', copy: 'The deck, the call, and the update describe three different companies.', Icon: GitBranch },
]
const loop = [
  { title: 'Capture', copy: 'Memo, chat, or doc', icon: Mic01Icon },
  { title: 'Structure', copy: 'Every claim, sourced', icon: Structure01Icon },
  { title: 'Stress-test', copy: 'The hard question', icon: MessageQuestionIcon },
  { title: 'Resolve', copy: 'You confirm what’s true', icon: TaskDone01Icon },
  { title: 'Render', copy: 'Deck, model, FAQ', icon: Presentation01Icon },
  { title: 'Rehearse', copy: 'Practice the room', icon: MentoringIcon },
]
const cardNavItems: CardNavItem[] = [
  {
    label: 'Product',
    bgColor: '#1B1722',
    textColor: '#fff',
    links: [
      { label: 'The problem', href: '#product', ariaLabel: 'Product' },
      { label: 'Claim Graph', href: '#product', ariaLabel: 'Claim Graph' },
    ],
  },
  {
    label: 'How it works',
    bgColor: '#2F293A',
    textColor: '#fff',
    links: [
      { label: 'The core loop', href: '#how', ariaLabel: 'How it works' },
      { label: 'See the tour', href: '#demo', ariaLabel: 'A two-minute transformation' },
    ],
  },
  // {
  //   label: 'For Accelerators',
  //   bgColor: '#2F293A',
  //   textColor: '#fff',
  //   links: [
  //     { label: 'Cohorts', href: '#accelerators', ariaLabel: 'For Accelerators' },
  //   ],
  // },
]
const agents = [
  {
    name: 'Scribe',
    rule: 'Keeps the thread',
    detail: 'The memo, the notes, and the docs stay on one project, so a later draft still knows what you said.',
  },
  {
    name: 'Extractor',
    rule: 'Cites the source',
    detail: 'Every claim comes from a line you wrote or said. A number points back to that sentence.',
  },
  {
    name: 'Investor Critic',
    rule: 'Asks what you skipped',
    detail: 'Reads the story the way a partner would, and asks the question you have not answered yet.',
  },
  {
    name: 'Benchmarker',
    rule: 'Labels comparisons',
    detail: 'A market figure stays a comparison. It never shows up as your own result.',
  },
  {
    name: 'Modeler',
    rule: 'Shows the math',
    detail: 'The workbook uses numbers you stated. Each assumption sits next to the cell it drives.',
  },
  {
    name: 'Narrator',
    rule: 'Writes what you confirmed',
    detail: 'The deck and the update come from confirmed claims. Anything you have not said stays out.',
  },
  {
    name: 'Consistency Auditor',
    rule: 'Catches the mismatch',
    detail: 'The deck, the model, and the story are checked against each other before anything goes out.',
  },
]
import { FounderVoiceLogo } from '../components/brand/FounderVoiceLogo'
import { ProgramLogos } from '../components/brand/ProgramLogos'

function Mark() { return <FounderVoiceLogo variant="mark" size={30} /> }
function Logo() { return <a href="#top" className="logo" aria-label="founderVoice"><FounderVoiceLogo variant="compact" size={32} theme="light" /></a> }
function Provenance({ children, tone = 'founder' }: { children: React.ReactNode; tone?: string }) { return <span className={`provenance ${tone}`}>{children}</span> }

const audiences = [
  {
    n: '01',
    title: 'Pre-seed and seed',
    summary: 'A story that holds up in the first partner meeting.',
    detail: 'The application, the deck, and the first call come from the same claims. A number you never stated stays marked.',
  },
  {
    n: '02',
    title: 'Programs and universities',
    summary: 'One standard for every founder in the cohort.',
    detail: 'Each founder keeps their own story. Mentors can see the gaps, and an unconfirmed claim is still watermarked when the file goes out.',
  },
  {
    n: '03',
    title: 'Teams already raising',
    summary: 'Updates and board packs that stay in sync.',
    detail: 'Change one figure once. The update, the board pack, and the model stay on that number.',
  },
]

const tour = [
  {
    n: '01',
    title: 'Capture',
    summary: 'You talk. The recording stays.',
    detail: 'Two minutes is enough. The memo, the captions, and your notes live on the same project.',
  },
  {
    n: '02',
    title: 'Structure',
    summary: 'The claims show up. So do the gaps.',
    detail: 'Each line comes from what you said, and is tagged as yours, a benchmark, a placeholder, or still open.',
  },
  {
    n: '03',
    title: 'Stress-test',
    summary: 'You hear the question you skipped.',
    detail: 'It reads the story the way a partner would in the room, and asks what you have not answered.',
  },
  {
    n: '04',
    title: 'Resolve',
    summary: 'The mismatch is caught before you send.',
    detail: 'Deck, model, and story are checked against each other. Unconfirmed claims stay watermarked. The file still downloads.',
  },
]

function DemoTour() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="demo-steps">
      {tour.map((step, index) => {
        const isOpen = open === index
        return (
          <div className={`demo-step${isOpen ? ' is-open' : ''}`} key={step.n}>
            <button
              type="button"
              className="demo-step-trigger"
              aria-expanded={isOpen}
              aria-controls={`demo-panel-${step.n}`}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span className="demo-step-index">{step.n}</span>
              <span className="demo-step-copy">
                <h3>{step.title}</h3>
                <p>{step.summary}</p>
              </span>
              <span className="demo-step-arrow" aria-hidden="true">
                <ArrowRight size={15} strokeWidth={2} />
              </span>
            </button>
            <div id={`demo-panel-${step.n}`} className="demo-step-panel" role="region" aria-hidden={!isOpen}>
              <div className="demo-step-panel-inner">
                <p>{step.detail}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AudienceDeck() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="audience-grid">
      {audiences.map((item, index) => {
        const isOpen = open === index
        return (
          <article className={`audience${isOpen ? ' is-open' : ''}`} key={item.n}>
            <button
              type="button"
              className="audience-trigger"
              aria-expanded={isOpen}
              aria-controls={`audience-panel-${item.n}`}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span className="audience-index">{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <span className="audience-arrow" aria-hidden="true">
                <ArrowRight size={15} strokeWidth={2} />
              </span>
            </button>
            <div id={`audience-panel-${item.n}`} className="audience-panel" role="region" aria-hidden={!isOpen}>
              <div className="audience-panel-inner">
                <p>{item.detail}</p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function AgentDeck() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState(0)
  const [pinX, setPinX] = useState(0)

  function place(index: number, node: HTMLElement) {
    const grid = gridRef.current
    if (!grid) return
    const gridBox = grid.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    setPinX(box.left + box.width / 2 - gridBox.left)
    setShown(index)
    setActive(index)
  }

  useEffect(() => {
    const grid = gridRef.current
    if (!grid || active === null) return
    const update = () => {
      const node = grid.querySelector<HTMLElement>(`[data-agent="${active}"]`)
      if (!node) return
      const gridBox = grid.getBoundingClientRect()
      const box = node.getBoundingClientRect()
      setPinX(box.left + box.width / 2 - gridBox.left)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(grid)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [active])

  const agent = agents[shown]

  return (
    <div
      className={`agent-stage${active !== null ? ' has-active' : ''}`}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return
        setActive(null)
      }}
    >
      <div className="agent-grid" ref={gridRef}>
        {agents.map((item, index) => (
          <button
            key={item.name}
            type="button"
            data-agent={index}
            className={`agent${active === index ? ' is-active' : ''}`}
            aria-expanded={active === index}
            aria-controls="agent-detail"
            onPointerEnter={(event) => {
              if (event.pointerType !== 'mouse') return
              place(index, event.currentTarget)
            }}
            onFocus={(event) => place(index, event.currentTarget)}
            onClick={(event) => {
              if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
              if (active === index) {
                setActive(null)
                return
              }
              place(index, event.currentTarget)
            }}
          >
            <span className="agent-index">A{index + 1}</span>
            <h3>{item.name}</h3>
            <p>{item.rule}</p>
          </button>
        ))}
      </div>
      <div id="agent-detail" className={`agent-detail${active !== null ? ' is-open' : ''}`} role="region" aria-live="polite" aria-hidden={active === null}>
        <div className="agent-detail-clip">
          <span className="agent-caret" style={{ left: pinX }} aria-hidden="true" />
          <div className="agent-detail-card">
            <span className="agent-detail-index">A{shown + 1}</span>
            <h3>{agent.name}</h3>
            <p className="agent-detail-rule">{agent.rule}</p>
            <p>{agent.detail}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function WaitlistOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setClosing(false)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 280)
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function dismiss() {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setClosing(false)
      setStatus('idle')
      setEmail('')
      setMessage('')
      onClose()
    }, 320)
  }

  useEffect(() => {
    if (status !== 'done') return
    const timer = window.setTimeout(dismiss, 2000)
    return () => window.clearTimeout(timer)
  }, [status])

  async function join() {
    if (status === 'loading' || status === 'done') return
    setStatus('loading')
    setMessage('')
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json()) as { message?: string; error?: string }
      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Try again.')
        return
      }
      setStatus('done')
      setMessage(data.message || "You're on the list.")
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
  }

  function onNotify(next: boolean) {
    if (!next || status === 'loading' || status === 'done') return
    if (!formRef.current?.reportValidity()) return
    void join()
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className={`waitlist-layer${closing ? ' closing' : ''}`} role="presentation">
      <button className="waitlist-backdrop" type="button" aria-label="Close" onClick={dismiss} />
      <div className="waitlist-card" role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        <button className="waitlist-close" type="button" onClick={dismiss} aria-label="Close">
          <X size={18} />
        </button>
        <form ref={formRef} onSubmit={(event) => { event.preventDefault(); onNotify(true) }}>
          <p className="waitlist-kicker">Early access</p>
          <h2 id="waitlist-title">Get on the list</h2>
          <p>We’ll email you when a seat opens.</p>
          <label className="sr-only" htmlFor="waitlist-email">Email address</label>
          <div className="waitlist-field">
            <input
              ref={inputRef}
              id="waitlist-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              disabled={status === 'done'}
              onChange={(event) => setEmail(event.target.value)}
            />
            <i />
          </div>
          {status === 'error' ? <p className="waitlist-error">{message}</p> : null}
          <div className="waitlist-notify">
            <BellToggle
              offLabel="Notify me"
              onLabel="You'll be notified"
              color="#f5f5f5"
              background="#27272a"
              onColor="#18181b"
              onBackground="#f5f5f5"
              size="md"
              radius={22}
              ringAmplitude={17}
              ringPasses={5}
              ringDecay={1}
              ringDuration={820}
              ringPivot={16}
              crossfadeMs={200}
              revealBounce={0}
              waves
              clapper={false}
              pressed={status === 'done'}
              onChange={onNotify}
              disabled={status === 'loading' || status === 'done'}
            />
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function HeroVisual() {
  const gradientId = useId().replace(/:/g, '')
  const nodes = [
    { id: 'problem', label: 'PROBLEM', note: 'Confirmed', tone: 'ok', x: 20, y: 68 },
    { id: 'market', label: 'MARKET', note: 'Confirmed', tone: 'ok', x: 38, y: 30 },
    { id: 'traction', label: 'TRACTION', note: 'Founder-stated', tone: 'stated', x: 74, y: 20 },
    { id: 'team', label: 'TEAM', note: 'Confirmed', tone: 'ok', x: 52, y: 64 },
    { id: 'ask', label: 'ASK', note: 'Unverified', tone: 'open', x: 80, y: 56 },
  ]
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]))
  const edges: [string, string][] = [
    ['problem', 'market'],
    ['market', 'traction'],
    ['market', 'team'],
    ['team', 'ask'],
    ['traction', 'ask'],
  ]
  const bars = [18, 34, 52, 70, 46, 28, 62, 88, 54, 36, 22, 48, 76, 94, 68, 40, 24, 58, 82, 60, 32, 20, 44, 72, 50, 30]

  return <div className="hero-visual" aria-label="Voice memo resolving into a Claim Graph visualization">
    <div className="visual-glow" aria-hidden="true" />
    <div className="visual-top"><span className="eyebrow-dot" /> from your memo <span className="mono">FV-0428</span></div>
    <div className="waveform" aria-hidden="true">{bars.map((height, i) => <i key={i} style={{ height: `${height}%`, animationDelay: `${i * 70}ms` }} />)}</div>
    <div className="graph-stage">
      <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#3d7dff" />
          </linearGradient>
        </defs>
        {edges.map(([from, to]) => {
          const a = byId[from]
          const b = byId[to]
          return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`url(#${gradientId})`} />
        })}
      </svg>
      {nodes.map((node) => <div key={node.id} className={`graph-node tone-${node.tone}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
        <div className="graph-node-card"><span className="node-dot" />{node.label}<small>{node.note}</small></div>
      </div>)}
    </div>
    <div className="visual-footer"><span className="mono">12 claims, sourced</span><span><Provenance>You said it</Provenance> <Provenance tone="unverified">Still open</Provenance></span></div>
  </div>
}

function ProblemChapter() {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const viewTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()')
    if (reduced || viewTimeline) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShown(true)
      observer.disconnect()
    }, { threshold: 0.3 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="product" ref={ref} className={`section-pad problem${shown ? ' is-shown' : ''}`}>
      <div className="section-intro">
        <span className="kicker">The problem</span>
        <h2>The story gets ahead of the company.</h2>
        <p>You can explain it out loud and still send a deck, a model, and an email that don’t match.</p>
      </div>
      <div className="problem-grid">
        {problems.map(({ title, copy, Icon }) => (
          <article className="problem-card" key={title}>
            <span className="problem-rule" aria-hidden="true" />
            <span className="problem-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Page() {
  const loopRef = useRef<HTMLElement>(null)
  const [annual, setAnnual] = useState(false); const [strict, setStrict] = useState(true); const [scrolled, setScrolled] = useState(false); const [waitlistOpen, setWaitlistOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const root = loopRef.current
    if (!root) return
    const track = root.querySelector<HTMLElement>('.loop-track')
    const items = [...root.querySelectorAll<HTMLElement>('.loop-item')]
    let frame = 0
    const update = () => {
      frame = 0
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const narrow = window.matchMedia('(max-width: 800px)').matches
      const distance = root.offsetHeight - window.innerHeight
      const progress = reduced || narrow || distance <= 0
        ? 1
        : Math.min(1, Math.max(0, -root.getBoundingClientRect().top / distance))
      track?.style.setProperty('--loop', progress.toFixed(4))
      items.forEach((item, index) => {
        item.classList.toggle('is-lit', progress >= index / Math.max(1, items.length - 1) - 0.001)
      })
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <main id="top">
    <CardNav
      logo={<FounderVoiceLogo variant="compact" size={28} theme="light" />}
      logoAlt="founderVoice"
      items={cardNavItems}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
      buttonLabel="Join"
      onButtonClick={() => setWaitlistOpen(true)}
    />
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}><div className="nav-inner"><Logo /><div className="nav-links"><a href="#product">Product</a><a href="#how">How it works</a>{/* <a href="#pricing">Pricing</a> */}{/* <a href="#accelerators">For Accelerators</a> */}</div><div className="nav-actions"><button className="nav-join" type="button" aria-label="Join" onClick={() => setWaitlistOpen(true)}><Bell size={16} strokeWidth={2} /><span>Join</span></button></div></div></nav>
    <section className="hero section-pad"><div className="hero-copy"><div className="eyebrow">For founders raising now</div><h1>Talk for two minutes. Leave with a <em>deck you can defend.</em></h1><p className="lede">FounderVoice turns a voice memo, a chat, or a doc into one story — then a deck, a model, and an FAQ that all say the same thing.</p><button className="button hero-join" type="button" onClick={() => setWaitlistOpen(true)}>Join the waitlist</button><p className="trust"><Check size={15}/> No invented numbers. Ever.</p></div><HeroVisual /></section>
    <div className="ticker"><span>For founders applying to</span><ProgramLogos /></div>
    <ProblemChapter />
    <section id="how" className="loop-scroll" ref={loopRef}><div className="loop-pin section-pad loop-section"><div className="section-intro center"><span className="kicker">How it works</span><h2>One company. One set of facts.</h2><p>Change a number once. The deck, the model, and the update move with it.</p></div><div className="loop-stage"><ol className="loop-track">{loop.map((step, i) => <li className="loop-item" key={step.title}><div className="loop-icon"><HugeiconsIcon icon={step.icon} size={20} strokeWidth={1.6} /></div><span className="mono">0{i + 1}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}</ol></div></div></section>
    <section className="section-pad claim-section"><div className="claim-copy"><span className="kicker">The source of truth</span><h2>Every claim has a <em>source.</em></h2><p>Not a pile of notes. Each line is tagged as something you said, a benchmark, a placeholder, or still open.</p><p className="mono quote">“If you didn’t say it, it isn’t in the deck.”</p><div className="legend"><Provenance>You said it</Provenance><Provenance tone="benchmark">Benchmark</Provenance><Provenance tone="placeholder">Placeholder</Provenance><Provenance tone="unverified">Still open</Provenance></div></div><HeroVisual /></section>
    <section className="section-pad honesty"><div className="honesty-card"><div><span className="kicker amber">Strict by default</span><h2>Pretty slides are easy. <em>Honest ones aren’t.</em></h2><div className="toggle-row"><span>Strict mode</span><button className={`toggle ${strict ? 'on' : ''}`} onClick={() => setStrict(!strict)} aria-pressed={strict}><i/></button><span className="mono">{strict ? 'ON' : 'OFF'}</span></div><ul className="feature-list"><li><Check/> Unconfirmed work is watermarked on export</li><li><Check/> Every model cell shows where it came from</li><li><Check/> Strip anything you haven’t confirmed before you send</li></ul></div><div className="export-card"><div className="export-head"><FileCheck2/> Investor update <span>•••</span></div><div className="export-lines"><b>Q2 ARR</b><strong>$184,000</strong><Provenance tone="unverified">STILL OPEN</Provenance><hr/><b>What changed</b><p>Pipeline expanded across 3 new design partners…</p></div><div className="watermark">INCLUDES CLAIMS YOU HAVEN’T CONFIRMED</div></div></div></section>
    <section className="section-pad agents"><div className="section-intro center"><span className="kicker">Who does the work</span><h2>Seven specialists.<br/>One rule: don’t make it up.</h2></div><AgentDeck /></section>
    <section id="audiences" className="audiences-band"><div className="section-pad audiences"><div className="section-intro center"><span className="kicker">Who it’s for</span><h2>Built for the whole raise.</h2></div><AudienceDeck /></div></section>
    <section id="demo" className="section-pad demo"><div className="section-intro"><span className="kicker">See it work</span><h2>Two minutes of talking. A pitch you can send.</h2><p>Four steps. Nothing added that you didn’t say.</p></div><DemoTour /></section>
    {/* <section id="pricing" className="section-pad pricing"><div className="section-intro center"><span className="kicker">Simple by design</span><h2>Start with the truth.</h2><div className="billing"><span>Monthly</span><button className={`toggle ${annual ? 'on' : ''}`} onClick={() => setAnnual(!annual)} aria-pressed={annual}><i/></button><span>Annual <b>save 20%</b></span></div></div><div className="price-grid"><Price name="Free" price="$0" copy="For founders finding their shape." items={['1 project','Outline only','Watermarked exports']} /><Price featured name="Pro" price={annual ? '$39' : '$49'} copy="For founders getting ready to raise." items={['Unlimited voice capture','Deck + financial model','Critic loop','2 style packs']} /><Price name="Raise" price={annual ? '$119' : '$149'} copy="For the full investor motion." items={['Mock investor room','Diligence link','Update composer','Connectors']} /></div></section> */}
    {/* <section id="accelerators" className="accelerator"><div><span className="kicker">For accelerators & universities</span><h2>Make every founder in your cohort fundable.</h2><p>White-label readiness infrastructure for your next 50 companies.</p></div><a className="ghost" href="#demo">Talk to us <ArrowRight size={16}/></a></section> */}
    <section className="final-cta"><div className="final-wave" aria-hidden="true">{[22, 20, 40, 36, 8, 8, 30, 28, 8, 46, 42, 8, 8, 26, 24, 48, 44, 8, 36, 32, 8, 8, 22, 18].map((height, i) => <i key={i} style={{ height, animationDelay: `${i * 0.08}s`, animationDuration: `${1.55 + (i % 5) * 0.16}s` }} />)}</div><span className="kicker">Your next raise</span><h2>Stop pitching from memory.<br/><em>Start pitching from the record.</em></h2><button className="button hero-join" type="button" onClick={() => setWaitlistOpen(true)}>Join the waitlist</button></section>
    <WaitlistOverlay open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Logo />
          <p>The workspace for an honest raise.</p>
          <p className="site-footer-line">Built for founders who’d rather be believed than impressive.</p>
        </div>
        <div className="site-footer-columns">
          <nav aria-label="Product">
            <h2>Product</h2>
            <a href="#product">The product</a>
            <a href="#how">How it works</a>
            <a href="#demo">See it work</a>
          </nav>
          <nav aria-label="Company">
            <h2>Company</h2>
            <a href="#audiences">Who it’s for</a>
            <button type="button" onClick={() => setWaitlistOpen(true)}>Join the waitlist</button>
          </nav>
        </div>
      </div>
      <div className="site-footer-base">
        <small>© 2026 FounderVoice</small>
        <small>No invented numbers.</small>
      </div>
    </footer>
  </main>
}
function Price({name, price, copy, items, featured=false}: {name:string;price:string;copy:string;items:string[];featured?:boolean}) { return <article className={`price-card ${featured?'featured':''}`}><div className="price-name">{name}{featured && <span>Most popular</span>}</div><h3>{price}<small>/mo</small></h3><p>{copy}</p><ul>{items.map(i=><li key={i}><Check size={15}/>{i}</li>)}</ul><a className={featured?'button':'ghost'} href="#top">Choose {name} <ArrowRight size={15}/></a></article> }

