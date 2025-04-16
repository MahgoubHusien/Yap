"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { session, isLoading } = useSessionContext();
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }

    const fetchProfile = async () => {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
      } else {
        setProfile(data);
      }
    };

    if (session?.user) fetchProfile();
  }, [session, isLoading]);

  if (isLoading || !profile) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
      <p>Email: {profile.email}</p>
      <p>Username: {profile.username}</p>
    </div>
  );
}
