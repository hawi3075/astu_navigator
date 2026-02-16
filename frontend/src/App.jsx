import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import CampusPage from './pages/CampusPage';
import SavedPage from './pages/SavedPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const [screen, setScreen] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('Home');

  // Handle Authentication Flow
  if (screen === 'landing') return <LandingPage onStart={() => setScreen('login')} />;
  
  if (screen === 'login') {
    return (
      <LoginPage 
        onLogin={() => setScreen('dashboard')} 
        onGoAdmin={() => setScreen('admin')} 
        onGoRegister={() => setScreen('register')} 
      />
    );
  }

  if (screen === 'register') return <RegisterPage onBackToLogin={() => setScreen('login')} />;

  // 🛡️ Admin Screen: Shows the dashboard you built
  if (screen === 'admin') {
    return <AdminDashboard onLogout={() => setScreen('login')} />;
  }

  // User Dashboard Flow
  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <MapPage />;
      case 'Campus': return <CampusPage />;
      case 'Saved': return <SavedPage />;
      case 'Settings': return <SettingsPage />;
      default: return <MapPage />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {renderContent()}
      {/* Navbar only for regular users */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;