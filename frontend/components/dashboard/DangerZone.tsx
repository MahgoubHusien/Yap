'use client';

export default function DangerZone() {
  const confirmDelete = () => {
    const confirmed = confirm('Are you sure you want to delete your account?');
    if (confirmed) {
      alert('Account deleted!');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Delete your account permanently.</p>
      </div>

      <button
        onClick={confirmDelete}
        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm"
      >
        Delete My Account
      </button>
    </section>
  );
}
