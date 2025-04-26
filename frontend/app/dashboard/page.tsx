"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/dashboard/ProfileForm";
import SecurityForm from "@/components/dashboard/SecurityForm";
import DangerZone from "@/components/dashboard/DangerZone";

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Use the direct Supabase client instead of the context hook
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      
      try {
        // Get session directly without relying on the context
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          router.push('/login');
          return;
        }
        
        if (!sessionData.session) {
          console.log("No active session");
          router.push('/login');
          return;
        }
        
        setSession(sessionData.session);
        
        // Try to fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionAndProfile();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  // Render different content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileForm />;
      case 'security':
        return <SecurityForm />;
      case 'danger':
        return <DangerZone />;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 mr-2 ${activeTab === 'profile' ? 'border-b-2 border-red-600 font-medium' : 'text-zinc-500'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 mr-2 ${activeTab === 'security' ? 'border-b-2 border-red-600 font-medium' : 'text-zinc-500'}`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-2 ${activeTab === 'danger' ? 'border-b-2 border-red-600 font-medium' : 'text-zinc-500'}`}
        >
          Danger Zone
        </button>
      </div>
      
      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}