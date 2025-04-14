"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    // Only redirect when we know for sure the user is not logged in
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  // While session info is loading from localStorage, show a loading state
  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  // If not loading anymore, but no session, Supabase says user is logged out
  if (!session) {
    return <div>Loading profile...</div>; 
    // or you could do: router.push("/login") inline here
  }

  // Otherwise, we have the session and can display the user data
  return (
    <div>
      <h1>👤 Profile Page</h1>
      <p>Welcome, {session.user.email}</p>
    </div>
  );
}
