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
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedEmail = localStorage.getItem("userEmail");
    const savedToken = localStorage.getItem("token");
    
    if (savedEmail && savedToken) {
      setIsLoggedIn(true);
      setUserEmail(savedEmail.toLowerCase().trim()); 
      setUserRole(savedRole || (savedEmail.toLowerCase() === "admin@astu.edu.et" ? 'admin' : 'user'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail(null); 
    setCurrentStep('Landing');
    setActiveTab('Home');
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      if (currentStep === 'Login') {
        return (
          <LoginPage 
            onBack={() => setCurrentStep('Landing')}
            onLoginSuccess={(data) => {
              const user = data.user || data; 
              const email = user.email.toLowerCase().trim();
              const role = email === "admin@astu.edu.et" ? 'admin' : 'user';

              localStorage.setItem("userRole", role); 
              localStorage.setItem("userEmail", email);
              if(data.token) localStorage.setItem("token", data.token);

              setUserEmail(email); 
              setUserRole(role);
              setIsLoggedIn(true);
            }} 
            onNavigateToRegister={() => setCurrentStep('Register')} 
          />
        );
      }
      if (currentStep === 'Register') {
        return <RegisterPage onBack={() => setCurrentStep('Landing')} onNavigateToLogin={() => setCurrentStep('Login')} />;
      }
      return <LandingPage onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} />;
    }

    if (userRole === 'admin') return <AdminDashboard onLogout={handleLogout} />;

    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Explore': 
      case 'Map': return <MapPage onNavigate={setActiveTab} userEmail={userEmail} />; 
      case 'Campus': return <Campus onNavigate={setActiveTab} />; 
      case 'Saved': return <SavedPage onNavigate={setActiveTab} userEmail={userEmail} />;
      case 'Profile': return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} userEmail={userEmail} />;
      default: return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className={`flex-1 w-full ${isLoggedIn && userRole !== 'admin' ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>
      {isLoggedIn && userRole !== 'admin' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;