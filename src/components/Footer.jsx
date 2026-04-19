import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                <span className="font-bold text-xl">G</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">GigConnect</span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-xs">
              Connect with top local talent for your next project. GigConnect makes freelancing easy and reliable.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">For Clients</h4>
            <ul className="space-y-4">
              <li><Link to="/jobs" className="hover:text-brand-400 transition-colors">Post a Job</Link></li>
              <li><Link to="/freelancers" className="hover:text-brand-400 transition-colors">Find Freelancers</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Project Management</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Payment Assurance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">For Freelancers</h4>
            <ul className="space-y-4">
              <li><Link to="/jobs" className="hover:text-brand-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Community</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Learning Hub</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Freelance Basics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-brand-400 transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} GigConnect Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm">
             <Link to="#" className="hover:text-white">English (US)</Link>
             <Link to="#" className="hover:text-white">$ USD</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
