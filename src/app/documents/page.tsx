import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DocumentList from "@/components/documents/DocumentList";

export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Documents</h1>
            <p className="text-gray-500">Deliverables, research, and notes from agents</p>
          </div>
          <DocumentList />
        </main>
      </div>
    </>
  );
}
