"use client";
type AuthMode = 'login' | 'signup';
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { createUser, verifyCredentials } from '../storage';
interface FormData {
  username: string;
  password: string;
  fullName?: string;        // only used in signup
  confirmPassword?: string; // only used in signup
}

interface FormErrors {
  username?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
  general?: string;
}

const initialFormData: FormData = {
  username: '',
  password: '',
  fullName: '',
  confirmPassword: '',
};

export default function AuthDemoPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === 'signup';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup) {
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // ────────────────────────────────────────────────
      //  Demo: simulate "successful" auth (no real backend)
      //  In a real app → call your auth API here
      // ────────────────────────────────────────────────
      if (isSignup) {
        console.log('Signup demo payload:', {
          fullName: formData.fullName,
          username: formData.username,
          password: formData.password,
        });
        // Simulate success → in real app: await authService.signUp(...)
      } else {
        console.log('Login demo payload:', {
          username: formData.username,
          password: formData.password,
        });
        // Simulate success → in real app: await authService.login(...)
      }

      // For demo purposes: pretend success and "redirect"
      alert(
        isSignup
          ? 'Demo signup successful! (no real account created)'
          : 'Demo login successful! (no real authentication)'
      );

      // In a real app → navigate('/dashboard');
    } catch (err: any) {
      setErrors({
        general: 'Demo error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isSignup ? 'Create a demo account' : 'Sign in to demo'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignup
              ? 'Already exploring the demo? '
              : 'Need to create a demo account? '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {isSignup && (
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="Username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              value={formData.password}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="Password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : isSignup ? (
                'Create demo account'
              ) : (
                'Sign in to demo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}