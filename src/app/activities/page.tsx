import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ActivityFeed from "@/components/feed/ActivityFeed";

export const dynamic = 'force-dynamic';

export default function ActivitiesPage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Activity Feed</h1>
            <p className="text-gray-500 mb-6">Real-time updates from all agents</p>
            <ActivityFeed />
          </div>
        </main>
      </div>
    </>
  );
}
