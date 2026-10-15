const steps = [
  {
    num: "1",
    title: "Capture",
    body: "Record, upload, or paste your pitch. Live captions + local STT.",
    tag: "US1",
  },
  {
    num: "2",
    title: "Confirm claims",
    body: "Problem, Solution, Market, Traction, Business Model — you review each claim.",
    tag: "US2–3",
  },
  {
    num: "3",
    title: "Close gaps",
    body: "Investor critic asks follow-ups on missing or unclear sections.",
    tag: "US4",
  },
  {
    num: "4",
    title: "Export pack",
    body: "Pitch deck, financial model, diligence pack — with provenance.",
    tag: "US5–10",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="sketch-label">
          How it works <span>— voice memo to investor pack</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.num} className="sketch-card p-5">
              <div className="flex items-baseline justify-between">
                <span className="sketch-title text-3xl">{step.num}</span>
                <span className="text-xs font-bold uppercase opacity-60">{step.tag}</span>
              </div>
              <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed opacity-80">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
