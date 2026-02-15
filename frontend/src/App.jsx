import React from 'react';
import MapPage from './pages/MapPage';
import Navbar from './components/NavBar';

function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* The main map and chat logic */}
      <MapPage />
      
      {/* The floating bottom navigation bar */}
      <Navbar />
    </div>
  );
}

export default App;