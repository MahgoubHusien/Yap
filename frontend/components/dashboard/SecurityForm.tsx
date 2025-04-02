'use client';
import { useState } from 'react';

export default function SecurityForm() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const updatePassword = async () => {
    setSaving(true);
    await new Promise(res => setTimeout(res, 1000));
    setSaving(false);
    alert('Password updated!');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your password</p>
      </div>

      <div className="space-y-4">
        <Input label="Current Password" value={current} onChange={e => setCurrent(e.target.value)} />
        <Input label="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
        <Input label="Confirm New Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={updatePassword}
          disabled={saving}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition"
        >
          {saving ? 'Saving...' : 'Update Password'}
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
        type="password"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
      />
    </div>
  );
}
