function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`
  }).join(' ')
}

export function ProgramLogos() {
  const euStars = Array.from({ length: 12 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 6
    const cx = 16 + Math.cos(angle) * 9.2
    const cy = 16 + Math.sin(angle) * 9.2
    return <polygon key={i} points={starPoints(cx, cy, 2.05, 0.82)} fill="#FC0" />
  })

  return <div className="ticker-logos">
    <svg className="logo-yc" viewBox="0 0 32 32" role="img" aria-label="Y Combinator">
      <rect width="32" height="32" rx="6" fill="#F26522" />
      <path fill="#fff" d="M8.1 7.4h4.15l3.75 6.55 3.75-6.55h4.15L17.7 17.1V24.6h-3.4V17.1L8.1 7.4z" />
    </svg>
    <svg className="logo-word" viewBox="0 0 148 28" role="img" aria-label="Techstars">
      <polygon points={starPoints(13, 14, 9, 3.8)} fill="#111318" />
      <text x="28" y="19.5" fill="#111318" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="700" letterSpacing="-0.4">techstars</text>
    </svg>
    <svg className="logo-eic" viewBox="0 0 78 32" role="img" aria-label="European Innovation Council">
      <circle cx="16" cy="16" r="16" fill="#003399" />
      {euStars}
      <text x="38" y="21" fill="#003399" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="700" letterSpacing="0.6">EIC</text>
    </svg>
    <svg className="logo-word" viewBox="0 0 112 28" role="img" aria-label="500 Global">
      <text x="0" y="21" fill="#111318" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="800" letterSpacing="-0.8">500</text>
      <text x="48" y="20" fill="#111318" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.1">GLOBAL</text>
    </svg>
    <svg className="logo-word" viewBox="0 0 86 28" role="img" aria-label="Antler">
      <text x="0" y="21" fill="#1a1a1a" fontFamily="Georgia, 'Times New Roman', serif" fontSize="22" letterSpacing="-0.4">antler</text>
    </svg>
  </div>
}
