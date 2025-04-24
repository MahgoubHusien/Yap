'use client';
import { useState, useEffect } from 'react';
import { supabaseClient } from "@/lib/supabaseClient";
import ProfilePhotoInput from '../ProfilePhotoInput';

export default function ProfileForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Fetch the current user and their profile data when component mounts
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      
      try {
        // Get current authenticated user
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          setDebugInfo(prev => ({ ...prev, userError }));
          setLoading(false);
          return;
        }
        
        if (userData.user) {
          setUser(userData.user);
          console.log("User found:", userData.user);
          setDebugInfo(prev => ({ ...prev, user: userData.user }));
          
          // Try to fetch existing profile data
          const { data: profileData, error: profileError } = await supabaseClient
            .from('profiles')
            .select('username, display_name, profile_picture')
            .eq('id', userData.user.id)
            .single();
          
          console.log("Profile data:", profileData);
          console.log("Profile error:", profileError);
          setDebugInfo(prev => ({ ...prev, profileData, profileError }));
          
          if (profileData && !profileError) {
            // If profile exists, populate the form
            setUsername(profileData.username || '');
            setDisplayName(profileData.display_name || '');
            
            // If there's a profile picture, set the preview URL
            if (profileData.profile_picture) {
              setPreviewUrl(profileData.profile_picture);
            }
          } else if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is expected for new users
            console.error("Error fetching profile:", profileError);
          }
        } else {
          console.warn("No user found in session");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setDebugInfo(prev => ({ ...prev, unexpectedError: error }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, []);
  
  // Handle photo selection (from ProfilePhotoInput)
  const handlePhotoSelect = (file: File) => {
    setProfilePicture(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear the selected photo
  const handleClearPhoto = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
  };
  
  // Function to save profile data
  const handleSave = async () => {
    if (!user) {
      alert('You need to be logged in to update your profile');
      return;
    }
    
    setLoading(true);
    const saveResults: any = {};
    
    try {
      // Check if the username is already taken (if username was changed)
      const { data: existingUsers, error: checkError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id);
      
      saveResults.usernameCheck = { existingUsers, checkError };
      
      if (checkError) {
        console.error("Error checking username:", checkError);
        throw checkError;
      }
        
      if (existingUsers && existingUsers.length > 0) {
        alert('Username is already taken. Please choose another one.');
        setLoading(false);
        return;
      }
      
      // Upload profile picture if one is selected
      let photoURL = previewUrl;
      if (profilePicture) {
        const filePath = `${user.id}/${Date.now()}-${profilePicture.name}`;
        
        const { error: uploadError } = await supabaseClient
          .storage
          .from("profile-photos")
          .upload(filePath, profilePicture, { upsert: true });
        
        saveResults.upload = { filePath, uploadError };
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data: publicData } = supabaseClient
          .storage
          .from("profile-photos")
          .getPublicUrl(filePath);
        
        saveResults.publicUrl = publicData;
          
        photoURL = publicData.publicUrl;
      }
      
      // Prepare the profile data
      const profileData = {
        id: user.id,
        username,
        display_name: displayName,
        profile_picture: photoURL,
        updated_at: new Date().toISOString()
      };
      
      saveResults.profileData = profileData;
      
      // Upsert the profile data (update if exists, insert if not)
      const { data: upsertData, error: upsertError } = await supabaseClient
        .from('profiles')
        .upsert(profileData)
        .select();
      
      saveResults.upsert = { upsertData, upsertError };
      
      if (upsertError) {
        console.error("Upsert error:", upsertError);
        throw upsertError;
      }
      
      console.log("Profile saved successfully:", upsertData);
      alert('Profile saved successfully!');
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setDebugInfo(prev => ({ ...prev, saveResults }));
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your profile information</p>
      </div>

      {/* Profile Photo Input */}
      <div className="flex flex-col items-center mb-6">
        <h3 className="text-lg font-medium mb-3">Profile Photo</h3>
        <ProfilePhotoInput
          previewUrl={previewUrl}
          onPhotoSelect={handlePhotoSelect}
          onClear={handleClearPhoto}
        />
      </div>

      <div className="space-y-4">
        <Input 
          label="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a unique username" 
        />
        
        <Input 
          label="Display Name" 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name as shown to others" 
        />
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

function Input({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (e: any) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-zinc-600 dark:text-zinc-400">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
      />
    </div>
  );
}