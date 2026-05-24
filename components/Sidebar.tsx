'use client';

import { BarChart3, BrainCircuit, Database, FileStack, Globe2, Network } from 'lucide-react';
import { sidebarSections } from '@/data/mockData';

type SidebarProps = {
  activeId: string;
  onSelect: (id: string, label: string, section: string) => void;
};

const sectionIcons = {
  GLOBAL: Globe2,
  REGIONES: Network,
  FUNCIONES: BarChart3,
  INTELIGENCIA: BrainCircuit,
  DATOS: Database,
  DOCUMENTOS: FileStack,
};

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  return (
    <aside className="glass fixed left-0 top-0 h-screen w-80 overflow-y-auto border-r px-5 py-6 shadow-premium">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">El Carmen Intelligence</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Operational Intelligence Platform</h1>
      </div>

      <nav className="space-y-5 pb-6">
        {sidebarSections.map((section) => {
          const Icon = sectionIcons[section.title as keyof typeof sectionIcons] ?? Globe2;
          return (
            <div key={section.title}>
              <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                <Icon size={14} className="text-emerald-400" />
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => onSelect(item.id, item.label, section.title)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        activeId === item.id
                          ? 'bg-emerald-900/35 text-emerald-200'
                          : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                    {item.id === 'func-finanzas' ? (
                      <button
                        onClick={() => onSelect('finance-cashflow', 'Cash Flow', 'FINANZAS')}
                        className={`ml-5 mt-1 flex w-[calc(100%-1.25rem)] items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                          activeId === 'finance-cashflow'
                            ? 'bg-emerald-900/35 text-emerald-200'
                            : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                        }`}
                      >
                        <span>Cash Flow</span>
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
