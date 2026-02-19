import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import Campus from './pages/Campus'; // This is your Campus Hub (Events/Clubs)
import Navbar from './components/NavBar';

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

  // ✅ FIXED ROUTING LOGIC
  const renderPage = () => {
    switch (activeTab) {
      case 'Home': 
        return <HomePage onNavigate={setActiveTab} />;
      
      // ✅ "Explore Campus" card now triggers this case
      case 'Map': 
        return <MapPage onNavigate={setActiveTab} />; 
      
      // ✅ "Campus Life" card and Navbar icon now trigger this case
      case 'Campus': 
        return <Campus onNavigate={setActiveTab} />; 
      
      case 'Saved': 
        return <SavedPage onNavigate={setActiveTab} />;
      
      case 'Profile': 
        return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} />;
      
      default: 
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
      {/* Navbar stays fixed at the bottom */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;