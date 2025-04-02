'use client';
import { useState } from 'react';

export default function ProfileForm() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('hello@gmail.com');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // simulate
    setLoading(false);
    alert('Saved!');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your basic info</p>
      </div>

      <div className="space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (e: any) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-zinc-600 dark:text-zinc-400">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
      />
    </div>
  );
}
