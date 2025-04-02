'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import SecurityForm from '@/components/dashboard/SecurityForm';
import DangerZone from '@/components/dashboard/DangerZone';

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState<'profile' | 'security' | 'danger'>('profile');

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-100 dark:bg-zinc-900 p-6 border-r border-zinc-200 dark:border-zinc-800 hidden sm:flex flex-col">
        <h1 className="text-xl font-semibold mb-10 tracking-tight">Yap Inc.</h1>

        <nav className="flex flex-col gap-4 text-sm">
          <TabButton label="Profile" isActive={currentTab === 'profile'} onClick={() => setCurrentTab('profile')} />
          <TabButton label="Security" isActive={currentTab === 'security'} onClick={() => setCurrentTab('security')} />
          <TabButton label="Danger Zone" isActive={currentTab === 'danger'} onClick={() => setCurrentTab('danger')} />
        </nav>

        <button
          className="mt-auto flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          onClick={() => console.log("Log out")}
        >
          <LogOut size={16} /> Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto">
        {currentTab === 'profile' && <ProfileForm />}
        {currentTab === 'security' && <SecurityForm />}
        {currentTab === 'danger' && <DangerZone />}
      </main>
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-3 py-2 rounded-md transition text-sm
        ${
          isActive
            ? 'bg-zinc-200 dark:bg-zinc-800 text-red-600 font-semibold'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
        }`}
    >
      {label}
    </button>
  );
}
