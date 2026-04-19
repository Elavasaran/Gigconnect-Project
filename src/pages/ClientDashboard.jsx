import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Users, Briefcase, DollarSign, Calendar, ChevronRight, Settings, MessageSquare, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ClientDashboard = () => {
  const { user, jobs, addJob, applications, updateApplicationStatus, resume } = useApp();
  const navigate = useNavigate();
  const [showPostJob, setShowPostJob] = useState(false);
  
  // Job Form State
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Development');
  const [desc, setDesc] = useState('');
  const [skills, setSkills] = useState('');

  const myJobs = jobs.filter(j => j.postedBy === user?.id || j.postedBy === 'client_1'); // Demo hack
  const totalSpend = myJobs.reduce((acc, curr) => acc + curr.budget, 0);

  const handlePostJob = (e) => {
    e.preventDefault();
    addJob({
      title,
      budget: parseInt(budget),
      category,
      description: desc,
      skills: skills.split(',').map(s => s.trim()),
      postedBy: user.id,
      location: 'Remote',
    });
    setShowPostJob(false);
    setTitle(''); setBudget(''); setDesc(''); setSkills('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job posts and hire the best talent.</p>
        </div>
        <Button onClick={() => setShowPostJob(true)} className="flex items-center gap-2">
            <Plus size={20} /> Post a New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
            { label: 'Total Jobs', val: myJobs.length, icon: Briefcase, color: 'text-brand-600 bg-brand-50' },
            { label: 'Active Hires', val: '2', icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Budgeted', val: `$${totalSpend}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Interviews', val: '5', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
         ].map((s, i) => (
            <Card key={i} className="p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                    <s.icon size={24} />
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{s.val}</p>
            </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Posted Jobs</h2>
            <div className="flex gap-2">
                <Badge variant="primary" className="cursor-pointer">Active</Badge>
                <Badge variant="default" className="cursor-pointer">Closed</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {myJobs.map(job => (
              <Card key={job.id} hover={false} className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-brand-600 font-semibold uppercase">{job.category}</span>
                            <span className="text-xs text-gray-400">• Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-50 mb-6">
                    <div className="text-center border-r border-gray-50">
                        <p className="text-xs text-gray-400 font-medium">Budget</p>
                        <p className="font-bold text-gray-900">${job.budget}</p>
                    </div>
                    <div className="text-center border-r border-gray-50">
                        <p className="text-xs text-gray-400 font-medium">Applicants</p>
                        <p className="font-bold text-gray-900">{applications.filter(a => a.jobId === job.id).length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium">Views</p>
                        <p className="font-bold text-gray-900">{Math.floor(Math.random()*100)}</p>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings size={14} /> Edit
                    </Button>
                    <Button variant="secondary" size="sm" className="flex items-center gap-2 text-brand-600 border-brand-100 hover:bg-brand-50">
                        View Applicants <ChevronRight size={14} />
                    </Button>
                 </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar - Pending Actions */}
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Applications</h2>
            <div className="space-y-4">
                {applications.filter(a => a.status === 'pending').length === 0 ? (
                    <Card className="p-12 text-center text-gray-400 italic">No pending applications</Card>
                ) : (
                    applications.filter(a => a.status === 'pending').map(app => {
                        const job = jobs.find(j => j.id === app.jobId);
                        return (
                            <Card key={app.id} className="p-4 border-l-4 border-l-amber-400">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={`https://ui-avatars.com/api/?name=${app.freelancerName || 'Freelancer'}`} className="w-10 h-10 rounded-full" alt="" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm leading-none">{app.freelancerName || 'John Doe'}</p>
                                        <p className="text-xs text-gray-400 mt-1">Applying for: <span className="text-brand-600">{job?.title}</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-9" onClick={() => updateApplicationStatus(app.id, 'accepted')}>
                                        <Check size={16} /> Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 h-9" onClick={() => updateApplicationStatus(app.id, 'rejected')}>
                                        <X size={16} /> Decline
                                    </Button>
                                    <Button 
                                      variant="secondary" 
                                      size="sm" 
                                      className="w-10 h-9 p-0"
                                      onClick={() => navigate('/chat')}
                                    >
                                        <MessageSquare size={16} />
                                    </Button>
                                    {resume && (
                                      <a 
                                        href={resume.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-[10px] text-brand-600 font-bold block mt-2 hover:underline"
                                      >
                                        View Resume
                                      </a>
                                    )}
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPostJob(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-brand-50/50">
                    <h2 className="text-2xl font-bold text-gray-900">Post a New Gig</h2>
                    <button onClick={() => setShowPostJob(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24} /></button>
                </div>
                <form onSubmit={handlePostJob} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Job Title" placeholder="e.g. Modern Web Design..." value={title} onChange={e => setTitle(e.target.value)} required />
                        <Input label="Budget ($)" type="number" placeholder="500" value={budget} onChange={e => setBudget(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-500" value={category} onChange={e => setCategory(e.target.value)}>
                            <option>Development</option>
                            <option>Design</option>
                            <option>Marketing</option>
                            <option>Writing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description</label>
                        <textarea rows="4" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-500" placeholder="Tell us about your project..." value={desc} onChange={e => setDesc(e.target.value)} required></textarea>
                    </div>
                    <Input label="Skills (comma separated)" placeholder="React, Node, Figma" value={skills} onChange={e => setSkills(e.target.value)} required />
                    
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPostJob(false)}>Cancel</Button>
                        <Button type="submit" className="flex-[2]">Post Job Now</Button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
