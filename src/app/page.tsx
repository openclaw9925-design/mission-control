import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

async function getStats() {
  const [
    totalTasks,
    tasksByStatus,
    agents,
    recentActivities,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.agent.findMany(),
    prisma.activity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
  ]);

  const statusCounts = tasksByStatus.reduce((acc, item) => {
    acc[item.status as keyof typeof acc] = item._count;
    return acc;
  }, {
    inbox: 0,
    assigned: 0,
    in_progress: 0,
    review: 0,
    done: 0,
    blocked: 0,
  });

  return {
    totalTasks,
    statusCounts,
    agents,
    recentActivities,
  };
}

export default async function Home() {
  const stats = await getStats();
  const activeAgents = stats.agents.filter(a => a.status === 'active').length;
  const idleAgents = stats.agents.filter(a => a.status === 'idle').length;
  const blockedAgents = stats.agents.filter(a => a.status === 'blocked').length;

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalTasks}</p>
                </div>
                <span className="text-4xl">📋</span>
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Agents</p>
                  <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
                </div>
                <span className="text-4xl">🤖</span>
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-gray-400">Idle: {idleAgents}</span>
                <span className="text-gray-400">Blocked: {blockedAgents}</span>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.statusCounts.in_progress}</p>
                </div>
                <span className="text-4xl">🔄</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Activities (24h)</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.recentActivities}</p>
                </div>
                <span className="text-4xl">📈</span>
              </div>
            </div>
          </div>

          {/* Task Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Status</h2>
              <div className="space-y-3">
                <StatusRow label="Inbox" count={stats.statusCounts.inbox} color="gray" />
                <StatusRow label="Assigned" count={stats.statusCounts.assigned} color="blue" />
                <StatusRow label="In Progress" count={stats.statusCounts.in_progress} color="yellow" />
                <StatusRow label="Review" count={stats.statusCounts.review} color="purple" />
                <StatusRow label="Done" count={stats.statusCounts.done} color="green" />
                <StatusRow label="Blocked" count={stats.statusCounts.blocked} color="red" />
              </div>
            </div>

            {/* Agent Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Agent Team</h2>
              <div className="space-y-3">
                {stats.agents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No agents configured yet. Run the seed script.</p>
                ) : (
                  stats.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {agent.name === 'clawdbot' ? '🤖' : agent.name === 'friday' ? '⚙️' : '🎨'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{agent.displayName}</p>
                          <p className="text-sm text-gray-500">{agent.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agent.status === 'active' ? 'bg-green-100 text-green-700' :
                        agent.status === 'blocked' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <a
                href="/tasks"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Task
              </a>
              <a
                href="/agents"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                View Agents
              </a>
              <a
                href="/activities"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Activity Feed
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function StatusRow({ label, count, color }: { label: string; count: number; color: string }) {
  const total = count || 0;
  const max = 10; // For visual scaling
  const width = Math.min((total / max) * 100, 100);
  
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-gray-600">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-8 text-sm text-gray-600 text-right">{total}</span>
    </div>
  );
}
