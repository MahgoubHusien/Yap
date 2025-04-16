"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProfilePage() {
  const { session, isLoading } = useSessionContext();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!isLoading && session) {
      const checkProfile = async () => {
        const { data, error } = await supabase
          .from("users") // your custom table
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (error || !data) {
          setProfileExists(false);
          router.push("/create-profile"); // send them to profile creation
        } else {
          setProfileExists(true); // profile exists
        }
      };

      checkProfile();
    } else if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router, supabase]);

  if (isLoading || profileExists === null) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1>👤 Profile Page</h1>
      <p>Welcome, {session.user.email}</p>
    </div>
  );
}
