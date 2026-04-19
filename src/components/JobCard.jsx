import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { MapPin, Clock, DollarSign, Bookmark, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const JobCard = ({ job }) => {
  if (!job) return null;
  const { user, applyToJob, applications } = useApp();
  const navigate = useNavigate();

  const isApplied = applications?.find(a => a.jobId === job.id && a.freelancerId === user?.id);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const success = applyToJob({ 
      jobId: job.id, 
      freelancerId: user.id, 
      freelancerName: user.name 
    });

    if (success) {
      navigate('/freelancer-dashboard');
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
            <Badge variant="primary">{job.category}</Badge>
            <Badge variant="default" className="flex items-center gap-1">
                <Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}
            </Badge>
        </div>
        <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
          <Bookmark size={20} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
        {job.title}
      </h3>
      
      <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-grow">
        {job.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin size={16} className="text-brand-500" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <DollarSign size={16} className="text-brand-500" />
          <span className="font-semibold text-gray-900">${job.budget}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100 italic">
            #{skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="px-2 py-1 text-gray-400 text-xs font-medium">+{job.skills.length - 3} more</span>
        )}
      </div>

      <div className="pt-6 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Briefcase size={16} />
              </div>
              <span className="text-xs text-gray-500">Posted by Client</span>
           </div>
           {user?.role === 'freelancer' && (
               <Button 
                size="sm" 
                onClick={handleApply}
                disabled={isApplied}
                variant={isApplied ? 'secondary' : 'primary'}
               >
                {isApplied ? 'Applied' : 'Apply Now'}
               </Button>
           )}
           {!user && (
              <Button size="sm" variant="outline" onClick={() => navigate('/login')}>Login to Apply</Button>
           )}
        </div>
      </div>
    </Card>
  );
};
