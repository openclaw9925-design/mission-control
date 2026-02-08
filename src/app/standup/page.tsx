import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StandupReport from "@/components/standup/StandupReport";

export const dynamic = 'force-dynamic';

export default function StandupPage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <StandupReport />
        </main>
      </div>
    </>
  );
}
