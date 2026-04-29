import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { storage } from '../utils/storage';
import { initialJobs, initialUsers } from '../utils/mockData';
import { supabase } from '../utils/supabase';

import { API_URL } from '../config';

const SOCKET_URL = API_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(storage.get('user', null));
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resume, setResume] = useState(storage.get('resume', null));
  const [theme, setTheme] = useState(storage.get('theme', 'light'));
  const [socket, setSocket] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.className = theme;
    storage.set('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Supabase Data Fetching
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setJobs(data);
      } else {
        setJobs(initialJobs);
      }
    } catch (err) {
      setJobs(initialJobs);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;
    try {
      // In a real app, we'd join with jobs, but for now let's just fetch applications
      const { data, error } = await supabase
        .from('applications')
        .select('*');
      
      if (!error && data) {
        // Filter based on user role (simulated for now)
        setApplications(data);
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        storage.set('user', updatedUser);
        
        if (data.resume_url) {
          const loadedResume = { url: data.resume_url, name: 'My Resume', date: data.updated_at || new Date().toISOString() };
          setResume(loadedResume);
          storage.set('resume', loadedResume);
        }
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchProfile();
      fetchApplications();
    }
  }, []); // Run once on mount

  // Sync state to storage
  useEffect(() => {
    if (user) storage.set('user', user);
  }, [user]);

  // Socket.IO and Supabase Real-time
  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      newSocket.emit('join', user.id);

      newSocket.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
        toast.success('New message received!', { position: 'top-right' });
      });

      newSocket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        toast(notif.message, { icon: '🔔', position: 'top-right' });
      });

      return () => newSocket.close();
    }
  }, [user]);

  const updateProfile = async (profileData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...profileData, 
          updated_at: new Date().toISOString() 
        });

      if (!error) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        storage.set('user', updatedUser);
        toast.success('Profile updated successfully!');
      } else {
        // Fallback to localStorage if Supabase fails (for user requirement)
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        storage.set('user', updatedUser);
        toast.success('Profile updated (locally)');
      }
    } catch (err) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      storage.set('user', updatedUser);
      toast.success('Profile updated (locally)');
    }
  };

  const login = (userData) => {
    setUser(userData);
    storage.set('user', userData);
    fetchProfile();
    fetchApplications();
  };

  const logout = () => {
    setUser(null);
    storage.remove('user');
    storage.remove('resume');
    setApplications([]);
    setMessages([]);
  };

  const addJob = async (job) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ 
          ...job, 
          posted_by: user.id,
          created_at: new Date().toISOString() 
        }])
        .select();

      if (!error && data) {
        setJobs([data[0], ...jobs]);
        toast.success('Job posted successfully!');
        return data[0];
      } else {
        // Fallback
        const newJob = { ...job, id: 'job_' + Date.now(), createdAt: new Date().toISOString() };
        setJobs([newJob, ...jobs]);
        toast.success('Job posted (locally)');
        return newJob;
      }
    } catch (err) {
      const newJob = { ...job, id: 'job_' + Date.now(), createdAt: new Date().toISOString() };
      setJobs([newJob, ...jobs]);
      toast.success('Job posted (locally)');
      return newJob;
    }
  };

  const applyToJob = async (application) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{ 
          ...application, 
          freelancer_id: user.id,
          status: 'pending', 
          created_at: new Date().toISOString() 
        }])
        .select();

      if (!error && data) {
        setApplications([...applications, data[0]]);
        toast.success('Application submitted successfully!');
        return true;
      } else {
        // Fallback
        const newApp = { ...application, id: 'app_' + Date.now(), status: 'pending', createdAt: new Date().toISOString() };
        setApplications([...applications, newApp]);
        toast.success('Application submitted (locally)');
        return true;
      }
    } catch (err) {
        const newApp = { ...application, id: 'app_' + Date.now(), status: 'pending', createdAt: new Date().toISOString() };
        setApplications([...applications, newApp]);
        toast.success('Application submitted (locally)');
        return true;
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appId);

      if (!error) {
        setApplications(applications.map(app => 
          app.id === appId ? { ...app, status } : app
        ));
        toast.success(`Application ${status}!`);
      } else {
        setApplications(applications.map(app => 
          app.id === appId ? { ...app, status } : app
        ));
        toast.success(`Application ${status} (locally)!`);
      }
    } catch (err) {
        setApplications(applications.map(app => 
          app.id === appId ? { ...app, status } : app
        ));
        toast.success(`Application ${status} (locally)!`);
    }
  };

  const sendMessage = (msg) => {
    if (socket) {
      socket.emit('send_message', msg);
    }
    const newMsg = { ...msg, id: 'msg_' + Date.now().toString(), timestamp: new Date().toISOString() };
    setMessages([...messages, newMsg]);
  };

  const addNotification = async (notif) => {
    const newNotif = { ...notif, id: 'notif_' + Date.now().toString(), read: false, createdAt: new Date().toISOString() };
    setNotifications([newNotif, ...notifications]);
    if (socket) {
      socket.emit('notification', newNotif);
    }
  };

  const markNotificationRead = (notifId) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const uploadResume = async (file) => {
    if (!user) return;
    
    // Client-side validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed!');
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max limit is 2MB.');
      return false;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', user.id);

    try {
      const response = await fetch(`${SOCKET_URL}/api/resume/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const newResume = { url: data.resumePath, name: file.name, date: new Date().toISOString() };
        setResume(newResume);
        storage.set('resume', newResume);
        
        // Update user object as well
        const updatedUser = { ...user, resume_url: data.resumePath };
        setUser(updatedUser);
        storage.set('user', updatedUser);
        
        toast.success('Resume uploaded successfully!');
        return true;
      } else {
        toast.error(data.error || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Server error during upload');
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      user, jobs, applications, messages, notifications, resume, socket, theme,
      login, logout, addJob, applyToJob, updateApplicationStatus,
      sendMessage, addNotification, markNotificationRead, updateProfile, setResume, toggleTheme, uploadResume
    }}>
      <Toaster />
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
