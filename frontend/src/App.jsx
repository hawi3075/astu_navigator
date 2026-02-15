import React from 'react';
import MapPage from './pages/MapPage';
import Navbar from './components/NavBar';

function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapPage />
      <Navbar />
    </div>
  );
}

export default App;