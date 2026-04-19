import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { JobCard } from '../components/JobCard';
import { initialFreelancers } from '../utils/mockData';
import { Search, MapPin, Star, Shield, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  const { jobs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const features = [
    {
      title: 'Verified Experts',
      desc: 'All our freelancers go through a rigorous verification process to ensure quality.',
      icon: Shield,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Fast Delivery',
      desc: 'Get your projects completed in days, not weeks, with our efficient workflow.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Secure Payments',
      desc: 'Our escrow system ensures that your funds are safe until you are satisfied.',
      icon: Shield,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-brand-50 rounded-l-[100px] opacity-50 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                Connect with the <span className="text-brand-600">Perfect</span> Freelancer
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                GigConnect is the premium hyperlocal marketplace where talent meets opportunity. Find experts for any job, anywhere.
              </p>

              <div className="bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-2">
                <div className="flex-grow flex items-center px-4 gap-3">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for jobs or skills..."
                    className="w-full py-4 text-gray-900 outline-none placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-grow flex items-center px-4 gap-3 border-t md:border-t-0 md:border-l border-gray-100">
                  <MapPin size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Location..."
                    className="w-full py-4 text-gray-900 outline-none placeholder:text-gray-400"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button size="lg" className="rounded-2xl">Search Now</Button>
              </div>

              <div className="mt-8 flex items-center gap-6">
                 <p className="text-sm font-medium text-gray-400">Popular:</p>
                 <div className="flex gap-4">
                    {['React', 'UI Design', 'Logo', 'SEO'].map(tag => (
                        <button key={tag} className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">#{tag}</button>
                    ))}
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: 'Active Freelancers', value: '45k+' },
                    { label: 'Completed Jobs', value: '120k+' },
                    { label: 'Client Satisfaction', value: '98%' },
                    { label: 'Avg. Project Rate', value: '$45/h' },
                ].map((stat, i) => (
                    <div key={i} className="text-center">
                        <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why choose GigConnect?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide the best tools for both clients and freelancers to thrive in the modern economy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="text-center p-10">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Opportunities</h2>
              <p className="text-gray-600">Apply to these freshly posted jobs and start your next project.</p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center gap-2">
                Browse All Jobs <ArrowRight size={18} />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {jobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="py-24 bg-brand-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Top-Rated Professionals</h2>
            <p className="text-brand-200">The best talent in the industry is waiting for your project.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {initialFreelancers.map((free) => (
              <div key={free.id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all text-center">
                <img src={free.avatar} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-brand-400" alt={free.name} />
                <h4 className="font-bold text-xl mb-1">{free.name}</h4>
                <p className="text-brand-300 text-sm mb-4">{free.role}</p>
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-6 font-bold">
                  <Star size={16} fill="currentColor" /> {free.rating}
                  <span className="text-white/50 font-medium text-xs ml-1">({free.reviews} reviews)</span>
                </div>
                <Button className="w-full bg-white text-brand-900 hover:bg-brand-50 hover:text-brand-900">View Profile</Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
