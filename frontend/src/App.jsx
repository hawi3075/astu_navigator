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

  // 1. Initial Load: Check for existing session
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
    // --- AUTHENTICATION FLOW ---
    if (!isLoggedIn) {
      if (currentStep === 'Login') {
        return (
          <LoginPage 
            onLoginSuccess={(data) => {
              // ✅ Save everything to localStorage immediately
              localStorage.setItem("userRole", data.role || "Student");
              localStorage.setItem("userEmail", data.email);
              localStorage.setItem("userName", data.full_name); 
              
              // ✅ Update state immediately to trigger Navbar render
              setUserRole(data.role || "Student");
              setIsLoggedIn(true);
              setActiveTab('Home'); // Ensure we start on Home
              setCurrentStep('Dashboard');
            }} 
            onNavigateToRegister={() => setCurrentStep('Register')} 
          />
        );
      }
      
      if (currentStep === 'Register') {
        return <RegisterPage onNavigateToLogin={() => setCurrentStep('Login')} />;
      }
      
      return (
        <LandingPage 
          onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} 
        />
      );
    }

    // --- DASHBOARD NAVIGATION ---
    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Explore': return <MapPage onNavigate={setActiveTab} />; // Matches Navbar 'Explore' label
      case 'Campus': return <Campus onNavigate={setActiveTab} />; 
      case 'Saved': return <SavedPage onNavigate={setActiveTab} />;
      case 'Profile': return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} />;
      default: return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={`flex flex-col bg-white font-sans ${isLoggedIn ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <div className={`flex-1 ${isLoggedIn ? 'overflow-y-auto pb-24' : ''}`}>
        {renderContent()}
      </div>

      {/* ✅ SIMPLIFIED NAVBAR LOGIC: Shows for ANY logged-in user who isn't an Admin */}
      {isLoggedIn && userRole !== 'Admin' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;