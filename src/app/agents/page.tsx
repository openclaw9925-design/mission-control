'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/types';
import Header from '@/components/layout/Header';
import AgentList from '@/components/agents/AgentList';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        if (data.success) {
          setAgents(data.data);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Agents</h2>
          <p className="text-sm text-gray-500">{agents.length} agents configured</p>
        </div>
        <AgentList agents={agents} />
      </div>
    </div>
  );
}
