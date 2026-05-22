import Link from 'next/link';

const highlights = [
  'Monitoreo de lotes y rendimiento genético en tiempo real',
  'KPIs ejecutivos para decisiones estratégicas semanales',
  'Visualización premium para equipos de dirección y campo',
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050807] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(31,97,72,0.25),transparent_58%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 md:px-10">
        <span className="mb-6 inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
          El Carmen Intelligence
        </span>

        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
          Plataforma de inteligencia genética
          <span className="block bg-gradient-to-r from-emerald-200 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
            para una agricultura de precisión premium
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
          Centralizá métricas clave, detectá señales críticas y alineá operaciones con una experiencia visual de alto nivel diseñada para equipos ejecutivos.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            Entrar al dashboard
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400/50 hover:text-emerald-200"
          >
            Ver capacidades
          </a>
        </div>

        <ul id="features" className="mt-14 grid gap-4 text-sm text-zinc-300 md:grid-cols-3">
          {highlights.map((item) => (
            <li key={item} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-sm">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
