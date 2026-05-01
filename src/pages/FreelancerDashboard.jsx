import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { JobCard } from '../components/JobCard';
import { Briefcase, CreditCard, Clock, Star, TrendingUp, CheckCircle, Plus, X, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { API_URL } from '../config';

export const FreelancerDashboard = () => {
  const { user, jobs, applications, updateProfile, resume, setResume, uploadResume } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const SOCKET_URL = API_URL;
  
  // Controlled Form State
  const [editForm, setEditForm] = useState({
    name: '',
    rate: '',
    skills: [],
    experience: ''
  });
  
  const [skillInput, setSkillInput] = useState('');

  // Load user data into form when editing starts
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        rate: user.rate || '45',
        skills: user.skills || [],
        experience: user.experience || ''
      });
    }
  }, [user, isEditing]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !editForm.skills.includes(skillInput.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile(editForm);
    setIsEditing(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadResume(file);
    }
  };

  const handleViewResume = () => {
    if (resume?.url) {
      const fullUrl = `${SOCKET_URL}${resume.url}`;
      window.open(fullUrl, '_blank');
    }
  };

  const myApplications = applications.filter(a => a.freelancerId === user?.id);
  const pendingApps = myApplications.filter(a => a.status === 'pending');
  const activeJobs = myApplications.filter(a => a.status === 'accepted');

  const stats = [
    { label: 'Total Earnings', value: `$${user?.earnings || '2,450'}`, icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Active Projects', value: activeJobs.length, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    { label: 'Applied', value: pendingApps.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Job Score', value: user?.rating || '4.9', icon: Star, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.name}!</h1>
            <Badge variant="primary" className="uppercase text-[10px] tracking-wider">
              {user?.plan || 'Free'} Plan
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">Here's what's happening with your freelance business today.</p>
        </div>
        <div className="flex gap-3">
            {(user?.plan === 'free' || !user?.plan) && (
              <Link to="/pricing">
                <Button variant="secondary" className="flex items-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                  <Crown size={18} /> Upgrade Plan
                </Button>
              </Link>
            )}
            {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                    Edit Profile <CheckCircle size={18} />
                </Button>
            )}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-12">
                <Card className="p-8 border-brand-200 bg-brand-50/10">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <h2 className="text-xl font-bold mb-6">Edit Professional Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                            <Input label="Hourly Rate ($)" type="number" value={editForm.rate} onChange={e => setEditForm({...editForm, rate: e.target.value})} required />
                        </div>
                        
                        {/* Skills Add Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Skills & Expertise</label>
                            <div className="flex gap-2">
                                <Input 
                                  placeholder="Add a skill (e.g. React)" 
                                  value={skillInput} 
                                  onChange={e => setSkillInput(e.target.value)} 
                                  onKeyPress={e => e.key === 'Enter' && handleAddSkill(e)}
                                />
                                <Button type="button" onClick={handleAddSkill} variant="secondary" className="px-4">
                                    <Plus size={20} />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {editForm.skills.map(skill => (
                                    <Badge key={skill} variant="primary" className="pl-3 pr-2 py-1 flex items-center gap-1 normal-case">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:bg-brand-100 rounded-full p-0.5">
                                            <X size={14} />
                                        </button>
                                    </Badge>
                                ))}
                                {editForm.skills.length === 0 && <p className="text-sm text-gray-400 italic">No skills added yet</p>}
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1.5">Brief Experience / Bio</label>
                             <textarea rows="3" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-500" value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} required />
                        </div>
                        <div className="flex gap-4">
                            <Button type="submit">Save Changes</Button>
                            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                 <TrendingUp size={12} /> +12%
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            <button className="text-brand-600 font-semibold hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.slice(0, 4).map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Resume</h3>
              {resume ? (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-100">
                          <div className="w-10 h-10 bg-brand-600 text-white rounded-lg flex items-center justify-center">
                              <span className="font-bold text-xs">PDF</span>
                          </div>
                          <div className="flex-grow min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{resume.name}</p>
                              <p className="text-xs text-gray-400">Uploaded {new Date(resume.date).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={handleViewResume}>View</Button>
                          <Button variant="secondary" className="flex-1 text-red-600" onClick={() => setResume(null)}>Delete</Button>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
                      <input 
                        type="file" 
                        id="resume-upload" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer text-brand-600 hover:text-brand-700 font-semibold block underline">
                          Upload Resume
                      </label>
                      <p className="text-xs text-gray-400 mt-2 px-4">PDF, DOC or DOCX (Max 5MB)</p>
                  </div>
              )}
           </Card>

           <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Applications</h2>
              <Card className="p-4 space-y-4">
                 {myApplications.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 italic">No applications yet</p>
                 ) : (
                    myApplications.map(app => {
                       const job = jobs.find(j => j.id === app.jobId);
                       return (
                          <div key={app.id} className="flex flex-col p-4 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:border-brand-200">
                             <h4 className="font-bold text-sm text-gray-900 mb-2 truncate">{job?.title}</h4>
                             <div className="flex justify-between items-center">
                                <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}>
                                   {app.status}
                                </Badge>
                                <span className="text-[10px] text-gray-400 font-medium">{new Date(app.createdAt).toLocaleDateString()}</span>
                             </div>
                          </div>
                       )
                    })
                 )}
              </Card>
           </div>

           <Card className="bg-brand-600 text-white p-8">
              <h3 className="text-xl font-bold mb-4 text-white">Pro Tip! 💡</h3>
              <p className="text-brand-100 text-sm mb-6 leading-relaxed">
                 Adding a video introduction to your profile increases your chances of getting hired by up to 300%.
              </p>
              <Button className="w-full bg-white text-brand-600 hover:bg-brand-50">Learn More</Button>
           </Card>
        </div>
      </div>
    </div>
  );
};
