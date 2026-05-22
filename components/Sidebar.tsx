'use client';

import { LayoutDashboard, Sprout, Globe2, Factory, BadgeDollarSign, Tractor, Landmark, Lightbulb, FileText } from 'lucide-react';
import { modules } from '@/data/mockData';

const icons = [LayoutDashboard, Sprout, Globe2, Factory, BadgeDollarSign, Tractor, Landmark, Lightbulb, FileText];

export function Sidebar() {
  return (
    <aside className="glass fixed left-0 top-0 h-screen w-72 border-r px-5 py-6 shadow-premium">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">El Carmen Intelligence</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Executive Platform V1</h1>
      </div>
      <nav className="space-y-2">
        {modules.map((module, idx) => {
          const Icon = icons[idx];
          return (
            <button
              key={module}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                idx === 0 ? 'bg-emerald-900/35 text-emerald-200' : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{module}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
