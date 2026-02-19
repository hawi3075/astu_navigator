import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import Campus from './pages/Campus';
import Navbar from './components/Navbar';

function App() {
  const [currentStep, setCurrentStep] = useState('Landing'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    const user = localStorage.getItem("userEmail");
    if (user) {
      setIsLoggedIn(true);
      setCurrentStep('Dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setCurrentStep('Landing');
    setActiveTab('Home');
  };

  // ✅ AUTH FLOW: Fixes the issue where Register/Login wouldn't show
  if (!isLoggedIn) {
    if (currentStep === 'Landing') {
      return <LandingPage onStart={() => setCurrentStep('Login')} />;
    }
    if (currentStep === 'Login') {
      return (
        <LoginPage 
          onLoginSuccess={() => { setIsLoggedIn(true); setCurrentStep('Dashboard'); }} 
          onNavigateToRegister={() => setCurrentStep('Register')} 
        />
      );
    }
    if (currentStep === 'Register') {
      return <RegisterPage onNavigateToLogin={() => setCurrentStep('Login')} />;
    }
  }

  // ✅ DASHBOARD: Fixes the "onNavigate is not a function" error
  const renderPage = () => {
    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Campus': return <MapPage onNavigate={setActiveTab} />;
      case 'Events': return <Campus onNavigate={setActiveTab} />;
      case 'Saved': return <SavedPage onNavigate={setActiveTab} />;
      case 'Profile': return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} />;
      default: return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto pb-20">
        {renderPage()}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;