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

  useEffect(() => {
    const user = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    
    if (user && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setCurrentStep('Dashboard');
    }
  }, []);

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
              const user = data.user || data; 
              const role = user.role || 'user';
              localStorage.setItem("userRole", role); 
              localStorage.setItem("userEmail", user.email);
              localStorage.setItem("userName", user.name || "Admin"); 
              setUserRole(role);
              setIsLoggedIn(true);
              setCurrentStep('Dashboard');
            }} 
            onNavigateToRegister={() => setCurrentStep('Register')} 
          />
        );
      }
      if (currentStep === 'Register') return <RegisterPage onNavigateToLogin={() => setCurrentStep('Login')} />;
      return <LandingPage onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} />;
    }

    if (userRole?.toLowerCase() === 'admin') {
       return <AdminDashboard onLogout={handleLogout} />;
    }

    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Map': return <MapPage onNavigate={setActiveTab} />; 
      case 'Campus': return <Campus onNavigate={setActiveTab} />; 
      case 'Saved': return <SavedPage onNavigate={setActiveTab} />;
      case 'Profile': return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} />;
      default: return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    /* Use min-h-screen and remove overflow-hidden to allow scrolling */
    <div className="flex flex-col bg-white font-sans min-h-screen">
      <div className={`flex-1 ${isLoggedIn && userRole?.toLowerCase() !== 'admin' ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>

      {isLoggedIn && userRole?.toLowerCase() !== 'admin' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;