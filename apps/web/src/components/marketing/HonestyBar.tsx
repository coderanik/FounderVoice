const rules = [
  "Agents draft — founders confirm every claim",
  "No invented placeholders in your model",
  "Strict mode watermarks export until you're ready",
];

export function HonestyBar() {
  return (
    <section className="border-y-[2.5px] border-[var(--ink)] bg-[var(--paper-light)]">
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-6 md:grid-cols-3 md:gap-6">
        {rules.map((rule) => (
          <p key={rule} className="text-center text-base md:text-left">
            <span className="mr-2 font-bold">✓</span>
            {rule}
          </p>
        ))}
      </div>
    </section>
  );
}
