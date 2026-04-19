import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    // Mock login logic
    setTimeout(() => {
      // In a real app, this would be an API call
      // For demo, we check if user exists in localStorage or just create a dummy session
      const mockUser = {
        id: 'user_' + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: email.includes('client') ? 'client' : 'freelancer', // Simple way to test roles
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      };
      
      login(mockUser);
      setLoading(false);
      navigate(mockUser.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-brand-600 flex items-center gap-2 font-medium">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6">
            <span className="font-bold text-3xl">G</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Log in to manage your gigs and projects.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Email address"
                  type="email"
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full py-3 h-12" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Log In'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-brand-600 hover:underline">Sign up for free</Link>
            </p>
          </div>
        </Card>
        
        <div className="mt-8 text-center bg-gray-100 p-4 rounded-xl">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">Demo Access</p>
            <div className="flex justify-center gap-4 text-xs">
                <code className="bg-white px-2 py-1 rounded shadow-sm">client@test.com</code>
                <code className="bg-white px-2 py-1 rounded shadow-sm">freelancer@test.com</code>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
