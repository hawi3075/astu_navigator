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
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentStep('Landing');
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      if (currentStep === 'Login') return <LoginPage onLoginSuccess={(data) => {
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userEmail", data.email);
        setUserRole(data.role);
        setIsLoggedIn(true);
      }} onNavigateToRegister={() => setCurrentStep('Register')} />;
      
      if (currentStep === 'Register') return <RegisterPage onNavigateToLogin={() => setCurrentStep('Login')} />;
      
      return <LandingPage onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} />;
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
    /* ✅ DYNAMIC WRAPPER: min-h-screen for Landing, h-screen for Dashboard */
    <div className={`flex flex-col bg-white font-sans ${isLoggedIn ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <div className={`flex-1 ${isLoggedIn ? 'overflow-y-auto' : ''}`}>
        {renderContent()}
      </div>
      {isLoggedIn && userRole === 'user' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;