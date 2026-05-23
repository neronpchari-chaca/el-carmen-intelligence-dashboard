type TopbarProps = {
  section: string;
  title: string;
};

export function Topbar({ section, title }: TopbarProps) {
  return (
    <header className="glass sticky top-0 z-10 mb-6 flex items-center justify-between rounded-2xl px-5 py-4 shadow-premium">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{section}</p>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-3 text-sm text-zinc-300">
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Mock data · Mayo 2026</span>
        <span className="rounded-full bg-zinc-700/40 px-3 py-1">Dark premium</span>
      </div>
    </header>
  );
}
