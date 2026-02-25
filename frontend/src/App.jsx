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
  const [userEmail, setUserEmail] = useState(null);

  // 1. Initial Load: Sync state with LocalStorage to keep user logged in on refresh
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedEmail = localStorage.getItem("userEmail");
    const savedToken = localStorage.getItem("token");
    
    if (savedToken && savedEmail) {
      setIsLoggedIn(true);
      setUserEmail(savedEmail.toLowerCase().trim()); 
      setUserRole(savedRole || (savedEmail.toLowerCase() === "admin@astu.edu.et" ? 'admin' : 'user'));
    }
  }, []);

  // 2. Logout Handler: Clears all security data
  const handleLogout = () => {
    localStorage.clear(); 
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail(null); 
    setCurrentStep('Landing');
    setActiveTab('Home');
  };

  // 3. Centralized Content Renderer
  const renderContent = () => {
    if (!isLoggedIn) {
      switch (currentStep) {
        case 'Login':
          return (
            <LoginPage 
              onBack={() => setCurrentStep('Landing')}
              onLoginSuccess={(data) => {
                // Debugging log: Helps us see the exact structure from authRoutes.js
                console.log("Login Payload Received:", data);
                
                // RESILIENCE: Try to find the token in data or data.token
                const token = data.token || (data.data ? data.data.token : null);
                
                if (!token) {
                  alert("Security Error: The server did not send a valid session token.");
                  console.error("TOKEN MISSING in response object:", data);
                  return;
                }

                // Handle nested user object or flat response
                const user = data.user || data; 
                const email = (user.email || "").toLowerCase().trim();
                const role = user.role || (email === "admin@astu.edu.et" ? 'admin' : 'user');

                // Update LocalStorage for persistence
                localStorage.setItem("token", token);
                localStorage.setItem("userRole", role); 
                localStorage.setItem("userEmail", email);
                
                // Update Application State
                setUserEmail(email); 
                setUserRole(role);
                setIsLoggedIn(true);
              }} 
              onNavigateToRegister={() => setCurrentStep('Register')} 
            />
          );
        case 'Register':
          return (
            <RegisterPage 
              onBack={() => setCurrentStep('Landing')} 
              onNavigateToLogin={() => setCurrentStep('Login')} 
            />
          );
        default:
          return <LandingPage onStart={(mode) => setCurrentStep(mode === 'register' ? 'Register' : 'Login')} />;
      }
    }

    // --- LOGGED IN VIEWS ---

    // Admin View
    if (userRole === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }

    // Student/User Views (Managed by Navbar)
    switch (activeTab) {
      case 'Home':    
        return <HomePage onNavigate={setActiveTab} />;
      case 'Explore': 
      case 'Map':     
        return <MapPage onNavigate={setActiveTab} userEmail={userEmail} />; 
      case 'Campus':  
        return <Campus onNavigate={setActiveTab} />; 
      case 'Saved':   
        return <SavedPage onNavigate={setActiveTab} userEmail={userEmail} />;
      case 'Profile': 
        return <ProfilePage onNavigate={setActiveTab} onLogout={handleLogout} userEmail={userEmail} />;
      default:        
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased">
      {/* Main Container: Adds padding at bottom for the fixed Navbar */}
      <main className={`flex-1 w-full ${isLoggedIn && userRole !== 'admin' ? 'pb-20' : ''}`}>
        {renderContent()}
      </main>
      
      {/* Navigation Bar: Fixed at the bottom for Mobile-First experience */}
      {isLoggedIn && userRole !== 'admin' && (
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;