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
  // ✅ 1. Added userEmail state to pass to MapPage
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));

  // 🔄 Session Restoration
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedEmail = localStorage.getItem("userEmail");
    
    if (savedEmail && savedRole) {
      setIsLoggedIn(true);
      setUserEmail(savedEmail); // ✅ Update state from localStorage
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
    setUserEmail(null); // ✅ Clear email state
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
              let role = (user.role || 'user').toLowerCase();
              if (user.email !== "admin@astu.edu.et" && role === 'admin') {
                role = 'user'; 
              }
              localStorage.clear();
              localStorage.setItem("userRole", role); 
              localStorage.setItem("userEmail", user.email);
              localStorage.setItem("userName", user.name || "User"); 
              if(data.token) localStorage.setItem("token", data.token);

              setUserEmail(user.email); // ✅ 2. Store email in state
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

    if (userRole === 'admin' && userEmail === "admin@astu.edu.et") {
       return <AdminDashboard onLogout={handleLogout} />;
    }

    // 3️⃣ STUDENT VIEW
    switch (activeTab) {
      case 'Home': return <HomePage onNavigate={setActiveTab} />;
      case 'Explore': 
      case 'Map': 
        // ✅ 3. Passed userEmail prop here to fix the alert
        return <MapPage onNavigate={setActiveTab} userEmail={userEmail} />; 
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