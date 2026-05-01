import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ClientDashboard } from './pages/ClientDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { ChatPage } from './pages/ChatPage';
import { Pricing } from './pages/Pricing';

const PrivateRoute = ({ children, role }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarFooter = ['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <main className="min-h-screen">
        {children}
      </main>
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/client-dashboard" 
              element={
                <PrivateRoute role="client">
                  <ClientDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/freelancer-dashboard" 
              element={
                <PrivateRoute role="freelancer">
                  <FreelancerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chat/:userId" 
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } 
            />
            <Route path="/jobs" element={<Home />} /> {/* Placeholder for now */}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
