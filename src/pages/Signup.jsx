import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User, Mail, Lock, Briefcase, UserCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Signup = () => {
  const [role, setRole] = useState('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const newUser = {
        id: 'user_' + Date.now(),
        name,
        email,
        role,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      };
      login(newUser);
      setLoading(false);
      navigate(role === 'client' ? '/client-dashboard' : '/freelancer-dashboard');
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
        className="w-full max-w-xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6">
            <span className="font-bold text-3xl">G</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Join thousands of professionals on GigConnect.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  role === 'freelancer'
                    ? 'border-brand-600 bg-brand-50 text-brand-600 shadow-md shadow-brand-500/10'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'freelancer' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Briefcase size={24} />
                </div>
                <span className="font-bold">I'm a Freelancer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  role === 'client'
                    ? 'border-brand-600 bg-brand-50 text-brand-600 shadow-md shadow-brand-500/10'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'client' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <UserCheck size={24} />
                </div>
                <span className="font-bold">I'm a Client</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                 <User className="absolute left-4 top-[42px] -translate-y-1/2 text-gray-400" size={18} />
                 <Input label="Full Name" placeholder="John Doe" className="pl-12" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="relative">
                 <Mail className="absolute left-4 top-[42px] -translate-y-1/2 text-gray-400" size={18} />
                 <Input label="Email" type="email" placeholder="john@example.com" className="pl-12" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-[42px] -translate-y-1/2 text-gray-400" size={18} />
              <Input label="Password" type="password" placeholder="Create a strong password" className="pl-12" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By creating an account, you agree to our <a href="#" className="text-brand-600 font-medium underline">Terms of Service</a> and <a href="#" className="text-brand-600 font-medium underline">Privacy Policy</a>.
            </p>

            <Button type="submit" className="w-full py-4 h-14 text-lg" disabled={loading}>
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                `Join as a ${role.charAt(0).toUpperCase() + role.slice(1)}`
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">Log in</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
