"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import ProfileForm from "@/components/dashboard/ProfileForm"; // Import your ProfileForm component (adjust the path as needed)

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get session directly from Supabase auth
    async function getSession() {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
      }
      
      setSession(data.session);
      setLoading(false);
      
      // Redirect if no session
      if (!data.session) {
        router.push("/login");
      }
    }
    
    getSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        // Redirect to login if signed out
        if (event === 'SIGNED_OUT') {
          router.push("/login");
        }
      }
    );
    
    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // While session info is loading, show a loading state
  if (loading) {
    return <div>Loading profile...</div>;
  }

  // If not loading anymore, but no session, user is logged out
  if (!session) {
    return <div>Loading profile...</div>; 
    // We'll get redirected by the useEffect above
  }

  // Otherwise, we have the session and can display the profile form
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>
      <ProfileForm />
    </div>
  );
}