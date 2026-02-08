'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Tasks', href: '/tasks', icon: '📋' },
  { name: 'Agents', href: '/agents', icon: '🤖' },
  { name: 'Documents', href: '/documents', icon: '📄' },
  { name: 'Activities', href: '/activities', icon: '📈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          Mission Control
        </h1>
        <p className="text-slate-400 text-sm mt-1">Agent Coordination Hub</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Agent Status */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
          Agents Online
        </div>
        <div className="flex gap-2">
          <span className="text-2xl" title="clawdbot (Coordinator)">🤖</span>
          <span className="text-2xl" title="Friday (Backend)">⚙️</span>
          <span className="text-2xl" title="Pixel (Frontend)">🎨</span>
        </div>
      </div>
    </aside>
  );
}
