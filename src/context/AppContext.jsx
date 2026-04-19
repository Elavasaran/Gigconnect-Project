import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { storage } from '../utils/storage';
import { initialJobs, initialUsers } from '../utils/mockData';

const SOCKET_URL = 'http://localhost:5000';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(storage.get('user', null));
  const [jobs, setJobs] = useState(storage.get('jobs', initialJobs));
  const [applications, setApplications] = useState(storage.get('applications', []));
  const [messages, setMessages] = useState(storage.get('messages', []));
  const [notifications, setNotifications] = useState(storage.get('notifications', []));
  const [resume, setResume] = useState(storage.get('resume', null));
  const [theme, setTheme] = useState(storage.get('theme', 'light'));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    document.documentElement.className = theme;
    storage.set('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      newSocket.emit('join', user.id);

      // Fetch user resume if exists
      fetch(`${SOCKET_URL}/api/user/${user.id}/resume`)
        .then(res => res.json())
        .then(data => {
            if (data.resume) setResume({ url: data.resume, name: 'My Resume', date: new Date().toISOString() });
        })
        .catch(err => console.log('Resume fetch error:', err));

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

  useEffect(() => {
    // Seed users list for lookups if empty
    if (storage.get('users', []).length === 0) {
      storage.set('users', initialUsers);
    }
  }, []);

  useEffect(() => {
    storage.set('user', user);
  }, [user]);

  useEffect(() => {
    storage.set('jobs', jobs);
  }, [jobs]);

  useEffect(() => {
    storage.set('applications', applications);
  }, [applications]);

  useEffect(() => {
    storage.set('messages', messages);
  }, [messages]);

  useEffect(() => {
    storage.set('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    storage.set('resume', resume);
  }, [resume]);

  const updateProfile = (profileData) => {
    setUser(prev => ({ ...prev, ...profileData }));
    
    // Also update in users list if we were tracking all users
    const users = storage.get('users', []);
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, ...profileData } : u);
    storage.set('users', updatedUsers);
    
    alert('Profile updated successfully!');
  };

  const login = (userData) => {
    setUser(userData);
    // Ensure user is in our "users" list for chat lookups etc
    const users = storage.get('users', []);
    if (!users.find(u => u.id === userData.id)) {
      storage.set('users', [...users, userData]);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addJob = (job) => {
    const newJob = { 
      ...job, 
      id: 'job_' + Date.now().toString(), 
      createdAt: new Date().toISOString(), 
      applicants: [] 
    };
    setJobs([newJob, ...jobs]);
    alert('Job posted successfully!');
    return newJob;
  };

  const applyToJob = (application) => {
    // Check if already applied
    if (applications.find(a => a.jobId === application.jobId && a.freelancerId === application.freelancerId)) {
      alert('You have already applied for this job!');
      return false;
    }

    const newApp = { 
      ...application, 
      id: 'app_' + Date.now().toString(), 
      status: 'pending', 
      createdAt: new Date().toISOString() 
    };
    setApplications([...applications, newApp]);
    
    // Notify client
    const job = jobs.find(j => j.id === application.jobId);
    if (job) {
      addNotification({
        userId: job.postedBy,
        title: 'New Applicant',
        message: `${user.name} applied for "${job.title}"`,
        type: 'application',
      });
    }
    alert('Application submitted successfully!');
    return true;
  };

  const updateApplicationStatus = (appId, status) => {
    setApplications(applications.map(app => 
      app.id === appId ? { ...app, status } : app
    ));

    // Notify freelancer
    const app = applications.find(a => a.id === appId);
    if (app) {
      addNotification({
        userId: app.freelancerId,
        title: 'Application Update',
        message: `Your application for "${jobs.find(j => j.id === app.jobId)?.title}" was ${status}`,
        type: 'application',
      });
    }
    alert(`Application ${status}!`);
  };

  const sendMessage = (msg) => {
    if (socket) {
      socket.emit('send_message', msg);
    }
    const newMsg = { ...msg, id: 'msg_' + Date.now().toString(), timestamp: new Date().toISOString() };
    setMessages([...messages, newMsg]);
  };

  const addNotification = (notif) => {
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
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', user.id);

    try {
      const response = await fetch(`${SOCKET_URL}/api/resume/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResume({ url: data.resumePath, name: file.name, date: new Date().toISOString() });
        toast.success('Resume uploaded successfully!');
        return true;
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload resume');
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
