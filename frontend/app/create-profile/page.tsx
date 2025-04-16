"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSessionContext } from "@supabase/auth-helpers-react";

export default function CreateProfilePage() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { session } = useSessionContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      alert("User session not found");
      return;
    }

    const { data, error } = await supabase.from("users").insert([
      {
        email: session.user.email,
        username: username,
      },
    ]);

    if (error) {
      alert("Error creating profile: " + error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}
