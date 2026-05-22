import { DashboardContent } from '@/components/DashboardContent';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050807] via-[#08110D] to-[#030404]">
      <Sidebar />
      <div className="ml-0 px-4 py-4 md:ml-72 md:px-8 md:py-6">
        <Topbar />
        <DashboardContent />
      </div>
    </main>
  );
}
