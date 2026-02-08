'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Mission Control</h2>
          <p className="text-sm text-gray-500">Coordinating AI agent activities</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">System Active</span>
          </div>
          
          {/* Clock */}
          <div className="text-right">
            <div className="text-lg font-mono text-gray-800">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
