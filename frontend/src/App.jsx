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
      setUserRole(role.toLowerCase()); // Ensure lowercase comparison
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
    // 1. UNAUTHENTICATED FLOW
    if (!isLoggedIn) {
      if (currentStep === 'Login') {
        return (
          <LoginPage 
            onLoginSuccess={(data) => {
              // ✅ FIX: Extract the actual user object
              const user = data.user || data; 
              
              // ✅ FIX: Strictly use the role from the database response
              // We remove the || 'user' fallback to see the real data
              const role = user.role ? user.role.toLowerCase() : 'user';
              const name = user.name || (role === 'admin' ? "Admin" : "User");

              // Clear old storage before saving new user data
              localStorage.clear();

              localStorage.setItem("userRole", role); 
              localStorage.setItem("userEmail", user.email);
              localStorage.setItem("userName", name); 
              if(data.token) localStorage.setItem("token", data.token);

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

    // 🛡️ 2. ADMIN VIEW
    // Ensure strict check against 'admin'
    if (userRole === 'admin') {
       return <AdminDashboard onLogout={handleLogout} />;
    }

    // 🎓 3. STUDENT VIEW (Only if NOT admin)
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
    <div className="min-h-screen bg-white font-sans flex flex-col overflow-y-auto">
      {/* ✅ LAYOUT LOGIC: 
         Admin: Full screen content, no bottom navbar.
         User: Content with padding-bottom for the Navbar.
      */}
      <div className={`flex-1 w-full ${isLoggedIn && userRole !== 'admin' ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>

      {/* ✅ STUDENT NAV: Only shown for logged-in non-admin users */}
      {isLoggedIn && userRole !== 'admin' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;