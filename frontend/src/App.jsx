import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import Campus from './pages/Campus'; 
import Navbar from './components/NavBar';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const [currentStep, setCurrentStep] = useState('Landing'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [userRole, setUserRole] = useState(null);

  // 🔄 Restore Session on Refresh
  useEffect(() => {
    const user = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    
    if (user && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setCurrentStep('Dashboard');
    }
  }, []);

  // 🚪 Clear All Session Data
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentStep('Landing');
    setActiveTab('Home');
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      if (currentStep === 'Login') {
        return (
          <LoginPage 
            onLoginSuccess={(data) => {
              // Handle nested user object from backend
              const user = data.user || data; 
              const role = user.role || 'user';
              const name = user.name || (role === 'admin' ? "Admin" : "User");

              localStorage.setItem("userRole", role); 
              localStorage.setItem("userEmail", user.email);
              localStorage.setItem("userName", name); 

              setUserRole(role);
              setIsLoggedIn(true);
              setCurrentStep('Dashboard');
            }} 
            onNavigateToRegister={() => setCurrentStep('Register')} 
          />
        );
      }
      if (currentStep === 'Register') {
        return <RegisterPage onNavigateToLogin={() => setCurrentStep('Login')} />;
      }
      return <LandingPage onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} />;
    }

    // 🛡️ Admin View
    if (userRole?.toLowerCase() === 'admin') {
       return <AdminDashboard onLogout={handleLogout} />;
    }

    // 🎓 Student View
    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Explore': case 'Map': return <MapPage onNavigate={setActiveTab} />; 
      case 'Campus': return <Campus onNavigate={setActiveTab} />; 
      case 'Saved': return <SavedPage onNavigate={setActiveTab} />;
      case 'Profile': return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} />;
      default: return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    /**
     * ✅ SCROLL FIX: 
     * We use 'min-h-screen' to allow the body to grow.
     * We remove 'overflow-hidden' from any parent containers.
     */
    <div className="min-h-screen bg-white font-sans flex flex-col overflow-y-auto">
      <div className={`flex-1 w-full ${isLoggedIn && userRole?.toLowerCase() !== 'admin' ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>

      {/* ✅ STUDENT NAV: Only shown for non-admin users */}
      {isLoggedIn && userRole?.toLowerCase() !== 'admin' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;