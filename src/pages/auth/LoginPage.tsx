// src/pages/auth/LoginPage.tsx (Final, Corrected Version)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TreePine, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // This useEffect will now correctly handle the redirect AFTER a successful login
  useEffect(() => {
    if (user && !loading) {
      const defaultPath = user.role === 'admin' ? '/admin/dashboard' 
                         : user.role === 'teacher' ? '/teacher/dashboard' 
                         : '/parent/dashboard';
      navigate(defaultPath, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // FIX: Call the robust login function from our AuthContext.
      // This function correctly uses supabase.auth.signInWithPassword()
      // and handles fetching the user profile.
      const result = await login(formData.email, formData.password);
      
      if (result && !result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
      // No navigation is needed here. The useEffect hook will handle it automatically
      // when the global 'user' state is updated by the AuthContext.

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Show a full-screen loader only on initial app load while the session is being checked.
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl mx-auto flex items-center justify-center mb-4"
              >
                <TreePine className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Mom's Grove</h1>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                </div>

                <div className="relative">
                  <Input
                    type="password"
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoggingIn}
                disabled={!formData.email || !formData.password}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@demo.school / password123</p>
                <p><strong>Teacher:</strong> teacher@demo.school / password123</p>
                <p><strong>Parent:</strong> parent@demo.school / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};