'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Check if user was just registered
    if (searchParams.get('registered') === 'true') {
      toast.success('Registration successful! Please log in.');
    }
  }, [searchParams]);

  // Handle successful Google sign-in
  useEffect(() => {
    const handleGoogleSignIn = async () => {
      if (status === 'authenticated' && session?.user && googleLoading) {
        try {
          // Fetch complete user profile from your API
          const response = await fetch('/api/user/profile', {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store user data in localStorage
            const userDataForStorage = {
              id: data.user.id || session.user.id,
              name: data.user.name || session.user.name,
              email: data.user.email || session.user.email,
              profilePicture: data.user.profilePicture || session.user.image || '',
              bio: data.user.bio || '',
              phone: data.user.phone || '',
              address: data.user.address || '',
              role: data.user.role ,
            };
            
            localStorage.setItem('user', JSON.stringify(userDataForStorage));
            
            // Create a token for consistency (optional, but good for your existing setup)
            // Since NextAuth handles sessions, you might not need this
            // but keeping it for compatibility with your existing code
            localStorage.setItem('token', 'google-oauth-session');
            
            // Notify header to refresh
            window.dispatchEvent(new Event('user-data-updated'));
            
            // Show success toast
            toast.success('Signed in with Google successfully!');
            
            // Redirect to homepage
            setTimeout(() => {
              router.push('/');
            }, 1000);
          } else {
            // Fallback: use session data
            const userDataForStorage = {
              id: session.user.id,
              name: session.user.name || '',
              email: session.user.email || '',
              profilePicture: session.user.image || '',
              bio: '',
              phone: '',
              address: '',
              role: 'user', 
            };
            
            localStorage.setItem('user', JSON.stringify(userDataForStorage));
            localStorage.setItem('token', 'google-oauth-session');
            window.dispatchEvent(new Event('user-data-updated'));
            
            toast.success('Signed in with Google successfully!');
            
            setTimeout(() => {
              router.push('/');
            }, 1000);
          }
        } catch (err) {
          console.error('Error storing user data:', err);
          toast.error('Signed in but failed to load profile');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    handleGoogleSignIn();
  }, [status, session, googleLoading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        toast.error('Google sign-in failed');
        setGoogleLoading(false);
      }
      // Success handling is done in the useEffect above
    } catch (err: any) {
      toast.error('Something went wrong with Google sign-in');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token first
      localStorage.setItem('token', data.token);
      
      // Fetch complete user profile including profilePicture from S3
      try {
        const profileResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // Store complete user data with profilePicture
          const userDataForStorage = {
            id: profileData.user.id,
            name: profileData.user.name,
            email: profileData.user.email,
            profilePicture: profileData.user.profilePicture || '',
            bio: profileData.user.bio || '',
            phone: profileData.user.phone || '',
            address: profileData.user.address || '',
            role: profileData.user.role ,
          };
          
          localStorage.setItem('user', JSON.stringify(userDataForStorage));
          
          // Notify header to refresh and display profile picture
          window.dispatchEvent(new Event('user-data-updated'));
        } else {
          // Fallback: Use data from login response
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Fallback: Use data from login response
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      toast.success('Login successful! Redirecting...');

      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-pink hover:scale-105 cursor-pointer transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center cursor-pointer  justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}