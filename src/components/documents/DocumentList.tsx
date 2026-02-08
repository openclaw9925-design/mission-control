'use client';

import { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
  agent: {
    id: string;
    name: string;
    displayName: string;
  };
  task: {
    id: string;
    title: string;
  } | null;
}

const typeColors: Record<string, string> = {
  deliverable: 'bg-green-100 text-green-700',
  research: 'bg-blue-100 text-blue-700',
  protocol: 'bg-purple-100 text-purple-700',
  note: 'bg-gray-100 text-gray-700',
};

const typeIcons: Record<string, string> = {
  deliverable: '📦',
  research: '🔍',
  protocol: '📋',
  note: '📝',
};

const agentEmojis: Record<string, string> = {
  clawdbot: '🤖',
  friday: '⚙️',
  pixel: '🎨',
};

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();

    // Subscribe to SSE for real-time updates
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'document_created') {
        fetchDocuments();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(d => d.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Document List */}
      <div className="w-80 flex-shrink-0">
        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All
          </button>
          {Object.entries(typeIcons).map(([type, icon]) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {icon} {type}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📄</div>
              <p>No documents yet</p>
              <p className="text-sm">Documents created by agents will appear here</p>
            </div>
          ) : (
            filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id
                    ? 'bg-blue-50 border border-blue-300'
                    : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-lg">{typeIcons[doc.type] || '📄'}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${typeColors[doc.type] || 'bg-gray-100'}`}>
                    {doc.type}
                  </span>
                </div>
                <h4 className="font-medium text-gray-800 line-clamp-1">{doc.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{doc.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{agentEmojis[doc.agent.name] || '👤'} {doc.agent.displayName}</span>
                  <span>•</span>
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
        {selectedDoc ? (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`px-2 py-0.5 rounded text-xs ${typeColors[selectedDoc.type]}`}>
                  {typeIcons[selectedDoc.type]} {selectedDoc.type}
                </span>
                <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedDoc.title}</h2>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
              <span>{agentEmojis[selectedDoc.agent.name] || '👤'} {selectedDoc.agent.displayName}</span>
              <span>Created: {formatDate(selectedDoc.createdAt)}</span>
              <span>Updated: {formatDate(selectedDoc.updatedAt)}</span>
            </div>

            {selectedDoc.task && (
              <div className="bg-gray-50 rounded p-3 mb-4">
                <span className="text-xs text-gray-500">Linked Task</span>
                <a
                  href={`/tasks?highlight=${selectedDoc.task.id}`}
                  className="block text-blue-600 hover:underline"
                >
                  📋 {selectedDoc.task.title}
                </a>
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {selectedDoc.content}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <p>Select a document to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
