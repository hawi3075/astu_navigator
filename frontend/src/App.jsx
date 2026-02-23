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

  // 🔄 Session Restoration
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedEmail = localStorage.getItem("userEmail");
    
    if (savedEmail && savedRole) {
      setIsLoggedIn(true);
      if (savedEmail === "admin@astu.edu.et" && savedRole.toLowerCase() === 'admin') {
        setUserRole('admin');
      } else {
        setUserRole('user');
      }
    }
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentStep('Landing');
    setActiveTab('Home');
  };

  const renderContent = () => {
    // 1️⃣ UNAUTHENTICATED USERS
    if (!isLoggedIn) {
      if (currentStep === 'Login') {
        return (
          <LoginPage 
            // ⬅️ Navigate back to Landing
            onBack={() => setCurrentStep('Landing')}
            onLoginSuccess={(data) => {
              const user = data.user || data; 
              let role = (user.role || 'user').toLowerCase();
              if (user.email !== "admin@astu.edu.et" && role === 'admin') {
                role = 'user'; 
              }
              localStorage.clear();
              localStorage.setItem("userRole", role); 
              localStorage.setItem("userEmail", user.email);
              localStorage.setItem("userName", user.name || "User"); 
              if(data.token) localStorage.setItem("token", data.token);

              setUserRole(role);
              setIsLoggedIn(true);
            }} 
            onNavigateToRegister={() => setCurrentStep('Register')} 
          />
        );
      }
      if (currentStep === 'Register') {
        return (
          <RegisterPage 
            onBack={() => setCurrentStep('Landing')}
            onNavigateToLogin={() => setCurrentStep('Login')} 
          />
        );
      }
      return <LandingPage onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} />;
    }

    // 2️⃣ ADMIN VIEW
    if (userRole === 'admin' && localStorage.getItem("userEmail") === "admin@astu.edu.et") {
       return <AdminDashboard onLogout={handleLogout} />;
    }

    // 3️⃣ STUDENT VIEW
    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Explore': 
      case 'Map': return <MapPage onNavigate={setActiveTab} />; 
      case 'Campus': return <Campus onNavigate={setActiveTab} />; 
      case 'Saved': return <SavedPage onNavigate={setActiveTab} />;
      case 'Profile': return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} />;
      default: return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col overflow-y-auto">
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