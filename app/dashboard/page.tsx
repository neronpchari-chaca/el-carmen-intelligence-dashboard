'use client';

import { useState } from 'react';
import { DashboardContent } from '@/components/DashboardContent';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default function DashboardPage() {
  const [active, setActive] = useState({ id: 'global-dashboard', label: 'Dashboard Global', section: 'GLOBAL' });

  const handleSelect = (id: string, label: string, section: string) => {
    if (id === 'data-ingestion') {
      window.location.href = '/data-ingestion';
      return;
    }

    setActive({ id, label, section });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050807] via-[#08110D] to-[#030404]">
      <Sidebar activeId={active.id} onSelect={handleSelect} />
      <div className="ml-0 px-4 py-4 md:ml-80 md:px-8 md:py-6">
        <Topbar section={active.section} title={active.label} />
        <DashboardContent activeId={active.id} />
      </div>
    </main>
  );
}
