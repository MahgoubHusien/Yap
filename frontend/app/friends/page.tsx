// pages/friends-callbacks.tsx
import React from "react";

interface Friend {
  id: string;
  username: string;
  status: string;
}

interface Callback {
  id: string;
  callerId: string;
  calleeId: string;
  status: string;
  callRequestedAt: string;
}

const dummyFriends: Friend[] = [
  { id: "f1", username: "alice", status: "accepted" },
  { id: "f2", username: "bob", status: "pending" },
  { id: "f3", username: "charlie", status: "accepted" },
];

const dummyCallbacks: Callback[] = [
  { id: "cb1", callerId: "f1", calleeId: "f2", status: "pending", callRequestedAt: "2025-04-03T08:00:00Z" },
  { id: "cb2", callerId: "f2", calleeId: "f3", status: "accepted", callRequestedAt: "2025-04-04T09:00:00Z" },
];

const FriendsCallbacksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6">
        <h1 className="text-center text-4xl font-extrabold text-red-500">Friends &amp; Callbacks</h1>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-12">
        <section>
          <h2 className="text-3xl font-bold border-b border-red-500 pb-2 mb-4">Friends</h2>
          <div className="grid grid-cols-1 gap-6">
            {dummyFriends.map((friend) => (
              <div
                key={friend.id}
                className="p-6 border border-red-500 rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <p className="text-2xl font-bold">{friend.username}</p>
                <p className="mt-2 text-sm">
                  Status:{" "}
                  <span className="text-red-500 font-semibold">{friend.status}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold border-b border-red-500 pb-2 mb-4">Callbacks</h2>
          <div className="grid grid-cols-1 gap-6">
            {dummyCallbacks.map((callback) => (
              <div
                key={callback.id}
                className="p-6 border border-red-500 rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <p className="text-base">
                  <span className="font-bold text-red-500">Caller:</span> {callback.callerId}
                </p>
                <p className="mt-1 text-base">
                  <span className="font-bold text-red-500">Callee:</span> {callback.calleeId}
                </p>
                <p className="mt-1 text-base">
                  <span className="font-bold text-red-500">Status:</span> {callback.status}
                </p>
                <p className="mt-1 text-base">
                  <span className="font-bold text-red-500">Requested:</span>{" "}
                  {new Date(callback.callRequestedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FriendsCallbacksPage;
