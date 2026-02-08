import Header from '@/components/layout/Header';

export default function DocumentsPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Documents</h2>
          <p className="text-sm text-gray-500">Agent deliverables and research</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Documents Coming Soon</h3>
          <p className="text-gray-500">
            Document storage and management will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
