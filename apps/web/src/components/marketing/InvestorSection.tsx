export function InvestorSection() {
  return (
    <section id="investors" className="px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="sketch-label">
          For investors <span>— US9–10</span>
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="sketch-card p-6">
            <h3 className="sketch-title text-2xl">Check claim sources</h3>
            <p className="mt-3 text-base leading-relaxed opacity-85">
              Every claim tagged — founder-provided, assumption, or benchmark. See the original quote,
              timestamp, and confirmation status.
            </p>
            <ul className="mt-5 space-y-2 text-sm opacity-75">
              <li>→ Source origin per claim</li>
              <li>→ Founder confirmation status</li>
              <li>→ Assumption vs stated fact</li>
            </ul>
          </article>

          <article className="sketch-card p-6">
            <h3 className="sketch-title text-2xl">Access diligence pack</h3>
            <p className="mt-3 text-base leading-relaxed opacity-85">
              Deck, financial model, claim graph, and evidence in one place. Financial assumptions
              trace back to what the founder said.
            </p>
            <ul className="mt-5 space-y-2 text-sm opacity-75">
              <li>→ Deck + model + claim graph</li>
              <li>→ Financial provenance</li>
              <li>→ FAQ & evidence (roadmap)</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
