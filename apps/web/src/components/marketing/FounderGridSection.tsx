const features = [
  {
    title: "Voice capture",
    body: "Record, upload, or paste. Your words — not a generic template.",
    status: "Live",
  },
  {
    title: "Structured sections",
    body: "Claims grouped with MISSING badges for incomplete sections.",
    status: "Live",
  },
  {
    title: "Claim review",
    body: "Confirm, edit, or reject before anything enters your deck.",
    status: "Live",
  },
  {
    title: "Investor critic",
    body: "Follow-up questions from what you actually said.",
    status: "Live",
  },
  {
    title: "Deck & model",
    body: "PPTX + XLSX with labeled assumptions and provenance.",
    status: "Live",
  },
  {
    title: "Practice Q&A",
    body: "Timed investor sessions — coming next.",
    status: "Soon",
  },
];

export function FounderGridSection() {
  return (
    <section id="founders" className="border-t-[2.5px] border-[var(--ink)] bg-[var(--paper-light)] px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="product" className="sketch-label">
          For founders <span>— US1–8</span>
        </h2>
        <p className="mb-8 max-w-2xl text-lg opacity-85">
          Capture → claims → critic → export is live today. Practice sessions and slide editing are
          on the roadmap.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="sketch-card p-5">
              <span
                className={`inline-block border-[1.5px] border-[var(--ink)] px-2 py-0.5 text-xs font-bold uppercase ${
                  f.status === "Live" ? "bg-[var(--ink)] text-white" : "bg-white"
                }`}
              >
                {f.status}
              </span>
              <h3 className="mt-3 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-base leading-relaxed opacity-80">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
