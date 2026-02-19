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
// Corrected path to your new admin folder structure
import AdminDashboard from './pages/admin/AdminDashboard'; 

function App() {
  const [currentStep, setCurrentStep] = useState('Landing'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    
    if (user && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setCurrentStep('Dashboard');
    } else {
      setIsLoggedIn(false);
      setCurrentStep('Landing');
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentStep('Landing');
    setActiveTab('Home');
  };

  if (isLoading) return null;

  // ✅ 1. Auth Traffic Control
  // We return these directly so they aren't affected by the App's main CSS wrapper
  if (!isLoggedIn) {
    if (currentStep === 'Login') {
      return (
        <LoginPage 
          onLoginSuccess={(data) => { 
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userEmail", data.email);
            setUserRole(data.role);
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
    // This now allows the full LandingPage (Hero + Contact + Footer) to scroll naturally
    return (
      <LandingPage 
        onStart={(mode) => mode === 'register' ? setCurrentStep('Register') : setCurrentStep('Login')} 
      />
    );
  }

  // ✅ 2. Admin vs. User Redirection
  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // ✅ 3. Regular User Navigation Logic
  const renderPage = () => {
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
    /* ✅ This layout is specific for the Logged-In User Experience */
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans">
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;