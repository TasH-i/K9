'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
  phone: string;
  address: string;
  role?: string;
  createdAt: string;
  authProvider?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    address: '',
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    // If no token and not authenticated with OAuth, redirect to login
    if (!token && status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Wait for OAuth session to load
    if (status === 'loading') {
      return;
    }

    // Fetch profile once we know authentication status
    if (token || status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

 const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/user/profile', {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (status === 'authenticated') {
          await signOut({ redirect: false });
        }
        router.push('/login');
        return;
      }
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    setProfile(data.user);
    setFormData({
      name: data.user.name,
      bio: data.user.bio || '',
      phone: data.user.phone || '',
      address: data.user.address || '',
    });

    // Update localStorage with complete user data INCLUDING ROLE
    const userDataForStorage = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      profilePicture: data.user.profilePicture || '',
      bio: data.user.bio || '',
      phone: data.user.phone || '',
      address: data.user.address || '',
      role: data.user.role || 'user', // ADD THIS LINE
    };
    localStorage.setItem('user', JSON.stringify(userDataForStorage));

    // Dispatch event to notify header to refresh
    window.dispatchEvent(new Event('user-data-updated'));

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };



  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.user);

      // Update localStorage AND PRESERVE ROLE
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userData.name = data.user.name;
          userData.bio = data.user.bio;
          userData.phone = data.user.phone;
          userData.address = data.user.address;
          userData.role = data.user.role || userData.role; // PRESERVE role
          localStorage.setItem('user', JSON.stringify(userData));

          // Notify header to refresh
          window.dispatchEvent(new Event('user-data-updated'));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/upload-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setProfile((prev) => prev ? { ...prev, profilePicture: data.profilePicture } : null);

      // Update localStorage AND PRESERVE ROLE
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userData.profilePicture = data.profilePicture;
          userData.role = userData.role || 'user'; // PRESERVE role
          localStorage.setItem('user', JSON.stringify(userData));

          // Notify header to refresh
          window.dispatchEvent(new Event('user-data-updated'));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }

      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Check if user is authenticated with OAuth
      const isOAuthUser = status === 'authenticated';

      // Call logout API to clear cookies
      await fetch('/api/auth/logout', { method: 'POST' });

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // If OAuth user, sign out from NextAuth
      if (isOAuthUser) {
        await signOut({ redirect: false });
      }

      setShowLogoutModal(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (status === 'authenticated') {
        await signOut({ redirect: false });
      }

      setShowLogoutModal(false);
      router.push('/');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF4D6D] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-sm flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-[#FF4D6D]/20 bg-gradient-to-br from-[#FF4D6D] to-indigo-300 overflow-hidden shadow-lg">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={handleImageClick}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 bg-[#FF4D6D] cursor-pointer  text-white rounded-full p-2.5 shadow-lg hover:bg-[#FE925A] transition-all duration-200 disabled:opacity-50 border-4 border-white"
                    title="Upload profile picture"
                  >
                    {uploadingImage ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <h2 className="mt-4 text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{profile.email}</p>

                {/* Auth Provider Badge */}
                {profile.authProvider && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${profile.authProvider === 'google'
                        ? 'bg-blue-100 text-blue-700'
                        : ''
                        }`}
                    >
                      {profile.authProvider === 'google' && (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google Account
                        </>
                      )}
                    </span>
                  </div>
                )}
                {profile.role === 'admin' && (
                  <>
                    <span className="inline-flex mt-4 items-center gap-1.5 text-md font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shield-user"
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
                        <circle cx="12" cy="11" r="4" />
                      </svg>
                      Admin
                    </span>
                  </>
                )}

                <div className="mt-6 w-full">
                  <div className="bg-gradient-to-r from-[#FF4D6D]/10 to-indigo-400/10 rounded-lg p-4 border border-[#FF4D6D]/20">
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 text-[#FF4D6D] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">
                        Member since{' '}
                        <span className="font-semibold text-gray-900">
                          {new Date(profile.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="group flex px-6 py-1.5 cursor-pointer  mt-4 border-2 hover:bg-red-500 text-red-500 hover:text-white rounded-md font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  Logout  <LogOut className=" ml-4 w-5 h-5 text-red-500 group-hover:text-white transition-colors group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Profile Completeness</span>
                  <span className="text-sm font-semibold text-[#FF4D6D]">
                    {Math.round(
                      ((profile.bio ? 1 : 0) +
                        (profile.phone ? 1 : 0) +
                        (profile.address ? 1 : 0) +
                        (profile.profilePicture ? 1 : 0)) /
                      4 *
                      100
                    )}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-[#FF4D6D] to-indigo-400 text-white rounded-full">
                    Standard
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-gradient-to-r cursor-pointer  from-[#FF4D6D] to-indigo-400 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    <span className="hidden md:flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </span>
                    <span className="flex md:hidden items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile.name,
                        bio: profile.bio,
                        phone: profile.phone,
                        address: profile.address,
                      });
                    }}
                    className="px-5 py-2.5 bg-gray-100 cursor-pointer  text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all bg-white"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.name}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <p className="text-gray-700">{profile.email}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent resize-none transition-all bg-white"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-sm text-gray-500 mt-2 flex items-center justify-between">
                        <span>Share a bit about yourself</span>
                        <span className="font-medium">{formData.bio.length}/500</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio || (
                        <span className="text-gray-400 italic">No bio added yet</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent transition-all bg-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <p className="text-gray-700">
                        {profile.phone || (
                          <span className="text-gray-400 italic">No phone number added</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4D6D] focus:border-transparent resize-none transition-all bg-white"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  ) : (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-700 leading-relaxed">
                        {profile.address || (
                          <span className="text-gray-400 italic">No address added</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-gradient-to-r cursor-pointer  from-[#FF4D6D] to-indigo-400 text-white rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving Changes...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${showLogoutModal
          ? "opacity-50 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={handleLogoutCancel}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-white rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#FF4D6D] to-indigo-400 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-[#FF4D6D]" />
              </div>
              <div>
                <p className="text-gray-800 font-medium mb-1">
                  Are you sure you want to logout?
                </p>
                <p className="text-sm text-gray-600">
                  You will need to login again to access your account.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-3 bg-gray-100 cursor-pointer  hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF4D6D] cursor-pointer  to-indigo-400 hover:shadow-lg text-white font-medium rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}