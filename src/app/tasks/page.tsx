import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskBoard from "@/components/tasks/TaskBoard";

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <TaskBoard />
        </main>
      </div>
    </>
  );
}
