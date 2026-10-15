'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Bell, Check, ChevronDown, CircleHelp, FileCheck2, FileText, GitBranch, Headphones, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'
import CardNav, { type CardNavItem } from '../components/CardNav'
import BellToggle from '../components/BellToggle'

const problems = [
  ['Narrative compression', 'Problem → insight → solution → why now → why us', FileText],
  ['Number honesty', 'Real unit economics, not Excel theater', ShieldCheck],
  ['Diligence consistency', "Decks, calls, and emails that don’t contradict each other", GitBranch],
]
const loop = [
  ['Capture', 'Voice / chat / docs', Headphones], ['Structure', 'Claim Graph', GitBranch], ['Stress-test', 'Investor Critic Agent', CircleHelp], ['Resolve', 'Confirmed claims only', ShieldCheck], ['Render', 'Deck / model / FAQ', FileText], ['Rehearse', 'Mock investor Q&A', Sparkles],
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
  {
    label: 'For Accelerators',
    bgColor: '#2F293A',
    textColor: '#fff',
    links: [
      { label: 'Cohorts', href: '#accelerators', ariaLabel: 'For Accelerators' },
    ],
  },
]
const agents = [
  ['Scribe', 'Never lose context'],
  ['Extractor', 'Only cite source'],
  ['Investor Critic', 'Ask the hard question'],
  ['Benchmarker', 'Label every benchmark'],
  ['Modeler', 'Show the assumptions'],
  ['Narrator', 'No invented facts'],
  ['Consistency Auditor', 'Catch the mismatch'],
]
import { FounderVoiceLogo } from '../components/brand/FounderVoiceLogo'
import { ProgramLogos } from '../components/brand/ProgramLogos'

function Mark() { return <FounderVoiceLogo variant="mark" size={30} /> }
function Logo() { return <a href="#top" className="logo" aria-label="founderVoice"><FounderVoiceLogo variant="compact" size={32} theme="light" /></a> }
function Provenance({ children, tone = 'founder' }: { children: React.ReactNode; tone?: string }) { return <span className={`provenance ${tone}`}>{children}</span> }

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
          <p className="waitlist-kicker">FounderVoice</p>
          <h2 id="waitlist-title">Get Notified</h2>
          <p>We’ll let you know when it’s time to get started.</p>
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
    <div className="visual-top"><span className="eyebrow-dot" /> live claim graph <span className="mono">FV-0428</span></div>
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
    <div className="visual-footer"><span className="mono">12 claims resolved</span><span><Provenance>Founder-stated</Provenance> <Provenance tone="unverified">Unverified</Provenance></span></div>
  </div>
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
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}><div className="nav-inner"><Logo /><div className="nav-links"><a href="#product">Product</a><a href="#how">How it works</a>{/* <a href="#pricing">Pricing</a> */}<a href="#accelerators">For Accelerators</a></div><div className="nav-actions"><button className="nav-join" type="button" aria-label="Join" onClick={() => setWaitlistOpen(true)}><Bell size={16} strokeWidth={2} /><span>Join</span></button></div></div></nav>
    <section className="hero section-pad"><div className="hero-copy"><div className="eyebrow">Fundraising Readiness Infrastructure</div><h1>Turn rambling founder thinking into an <em>investor-ready truth.</em></h1><p className="lede">FounderVoice extracts a structured, honest Claim Graph from your voice, chat, and docs — then renders decks, financial models, and FAQs that never contradict each other.</p><button className="button hero-join" type="button" onClick={() => setWaitlistOpen(true)}>Join the waiting list</button><p className="trust"><Check size={15}/> No invented metrics. Ever.</p></div><HeroVisual /></section>
    <div className="ticker"><span>Trusted by founders applying to</span><ProgramLogos /></div>
    <section id="product" className="section-pad problem"><div className="section-intro"><span className="kicker">The uncomfortable part</span><h2>Fundraising breaks when the story outruns the source.</h2><p>Hiring a banker costs $5k–$25k+. Generic AI tools produce pretty lies.</p></div><div className="three-grid">{problems.map(([title, copy, Icon]) => <article className="line-card" key={title as string}><Icon size={22} strokeWidth={1.6}/><h3>{title as string}</h3><p>{copy as string}</p></article>)}</div></section>
    <section id="how" className="loop-scroll" ref={loopRef}><div className="loop-pin section-pad loop-section"><div className="section-intro center"><span className="kicker">The core loop</span><h2>One source of truth. Every output in sync.</h2><p>Change one number once. Your deck, model, FAQ, and investor update all stay in sync.</p></div><div className="loop-stage"><ol className="loop-track">{loop.map(([title, copy, Icon], i) => <li className="loop-item" key={title as string}><div className="loop-icon"><Icon size={22} strokeWidth={1.75}/></div><span className="mono">0{i + 1}</span><h3>{title as string}</h3><p>{copy as string}</p></li>)}</ol></div></div></section>
    <section className="section-pad claim-section"><div className="claim-copy"><span className="kicker">The flagship feature</span><h2>Meet the <em>Claim Graph.</em></h2><p>Not a JSON dump. A typed ontology of your company — every claim tagged Founder-stated, Benchmark-derived, Placeholder, or Unverified.</p><p className="mono quote">“No silent invention.”</p><div className="legend"><Provenance>Founder-stated</Provenance><Provenance tone="benchmark">Benchmark-derived</Provenance><Provenance tone="placeholder">Placeholder</Provenance><Provenance tone="unverified">Unverified</Provenance></div></div><HeroVisual /></section>
    <section className="section-pad honesty"><div className="honesty-card"><div><span className="kicker amber">The honesty engine</span><h2>The opposite of <em>AI hype.</em></h2><div className="toggle-row"><span>Strict mode</span><button className={`toggle ${strict ? 'on' : ''}`} onClick={() => setStrict(!strict)} aria-pressed={strict}><i/></button><span className="mono">{strict ? 'ON' : 'OFF'}</span></div><ul className="feature-list"><li><Check/> “Contains unverified assumptions” export watermark</li><li><Check/> Provenance-tagged spreadsheet cells</li><li><Check/> Strip unverified numbers before sending</li></ul></div><div className="export-card"><div className="export-head"><FileCheck2/> Investor update <span>•••</span></div><div className="export-lines"><b>Q2 ARR</b><strong>$184,000</strong><Provenance tone="unverified">UNVERIFIED</Provenance><hr/><b>What changed</b><p>Pipeline expanded across 3 new design partners…</p></div><div className="watermark">CONTAINS UNVERIFIED ASSUMPTIONS</div></div></div></section>
    <section className="section-pad agents"><div className="section-intro center"><span className="kicker">Technical credibility</span><h2>Seven agents.<br/>Zero hand-waving.</h2></div><div className="agent-grid">{agents.map(([name, rule], i) => <article key={name} className="agent"><span className="agent-index">A{i + 1}</span><h3>{name}</h3><p>{rule}</p></article>)}</div></section>
    <section className="section-pad audiences"><div className="section-intro center"><span className="kicker">Built for the whole fundraising motion</span><h2>Wherever your company is telling its story.</h2></div><div className="three-grid"><article className="audience"><span>01</span><h3>Pre-seed / seed founders</h3><p>Apply to accelerators with a narrative that can survive the first hard question.</p></article><article className="audience"><span>02</span><h3>University programs</h3><p>White-label fundraising readiness for every founder in your cohort.</p></article><article className="audience"><span>03</span><h3>Post-seed teams</h3><p>Investor updates and board packs that stay aligned as the company moves.</p></article></div></section>
    <section id="demo" className="section-pad demo"><div className="section-intro"><span className="kicker">A two-minute transformation</span><h2>From “uh, basically…” to “here’s the proof.”</h2></div><div className="demo-steps">{[['01','Capture','Founder records a rambling voice memo.'],['02','Structure','Claim Graph lights up — including the gaps.'],['03','Stress-test','Investor Critic asks the question everyone is thinking.'],['04','Resolve','Consistency Auditor catches a mismatch before export.']].map(([n,t,c]) => <div className="demo-step" key={n}><span className="mono">{n}</span><div><h3>{t}</h3><p>{c}</p></div><ArrowRight/></div>)}</div></section>
    {/* <section id="pricing" className="section-pad pricing"><div className="section-intro center"><span className="kicker">Simple by design</span><h2>Start with the truth.</h2><div className="billing"><span>Monthly</span><button className={`toggle ${annual ? 'on' : ''}`} onClick={() => setAnnual(!annual)} aria-pressed={annual}><i/></button><span>Annual <b>save 20%</b></span></div></div><div className="price-grid"><Price name="Free" price="$0" copy="For founders finding their shape." items={['1 project','Outline only','Watermarked exports']} /><Price featured name="Pro" price={annual ? '$39' : '$49'} copy="For founders getting ready to raise." items={['Unlimited voice capture','Deck + financial model','Critic loop','2 style packs']} /><Price name="Raise" price={annual ? '$119' : '$149'} copy="For the full investor motion." items={['Mock investor room','Diligence link','Update composer','Connectors']} /></div></section> */}
    <section id="accelerators" className="accelerator"><div><span className="kicker">For accelerators & universities</span><h2>Make every founder in your cohort fundable.</h2><p>White-label readiness infrastructure for your next 50 companies.</p></div><a className="ghost" href="#demo">Talk to us <ArrowRight size={16}/></a></section>
    <section className="final-cta"><div className="final-wave" aria-hidden="true">{[22, 20, 40, 36, 8, 8, 30, 28, 8, 46, 42, 8, 8, 26, 24, 48, 44, 8, 36, 32, 8, 8, 22, 18].map((height, i) => <i key={i} style={{ height, animationDelay: `${i * 0.08}s`, animationDuration: `${1.55 + (i % 5) * 0.16}s` }} />)}</div><span className="kicker">The last draft you’ll need</span><h2>Stop pitching from memory.<br/><em>Start pitching from truth.</em></h2><button className="button hero-join" type="button" onClick={() => setWaitlistOpen(true)}>Join the waiting list</button></section>
    <WaitlistOverlay open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    <footer><Logo/><p>Fundraising readiness infrastructure.</p><div className="footer-links"><span>Product</span><span>Company</span><span>Resources</span><span>Legal</span></div><small>Built for founders who’d rather be honest than impressive.</small></footer>
  </main>
}
function Price({name, price, copy, items, featured=false}: {name:string;price:string;copy:string;items:string[];featured?:boolean}) { return <article className={`price-card ${featured?'featured':''}`}><div className="price-name">{name}{featured && <span>Most popular</span>}</div><h3>{price}<small>/mo</small></h3><p>{copy}</p><ul>{items.map(i=><li key={i}><Check size={15}/>{i}</li>)}</ul><a className={featured?'button':'ghost'} href="#top">Choose {name} <ArrowRight size={15}/></a></article> }

