import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Campus = () => {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'events', 'clubs', 'blocks'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (type) => {
    setLoading(true);
    try {
      const endpoint = type === 'blocks' ? 'admin/locations_list' : type;
      const res = await axios.get(`http://localhost:8000/api/${endpoint}`);
      setData(res.data);
      setActiveTab(type);
    } catch (err) {
      console.error("Error fetching campus data", err);
    }
    setLoading(false);
  };

  if (activeTab === 'menu') {
    return (
      <div className="campus-container">
        <h1>ASTU Campus</h1>
        <p className="subtitle">Explore everything happening at Adama Science and Technology University</p>
        
        <div className="card-grid">
          <div className="campus-card" onClick={() => fetchData('events')}>
            <div className="icon">📅</div>
            <h3>Events</h3>
            <p>Check out upcoming seminars, sports meets, and cultural festivals.</p>
          </div>

          <div className="campus-card" onClick={() => fetchData('clubs')}>
            <div className="icon">👥</div>
            <h3>Student Clubs</h3>
            <p>Join 20+ active student organizations and enhance your campus life.</p>
          </div>

          <div className="campus-card" onClick={() => fetchData('blocks')}>
            <div className="icon">🎓</div>
            <h3>Academic Blocks</h3>
            <p>Navigate through the 12 major blocks and specialized laboratories.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="campus-detail-view">
      <button className="back-btn" onClick={() => setActiveTab('menu')}>← Back to Menu</button>
      <h2>{activeTab.toUpperCase()}</h2>
      
      {loading ? <p>Loading...</p> : (
        <div className="item-list">
          {data.map((item) => (
            <div key={item._id} className="detail-card">
              <h4>{item.title || item.name}</h4>
              <p>{item.description || "No description available."}</p>
              {item.date && <span className="meta">📅 {item.date} | 📍 {item.location}</span>}
              {item.category && <span className="tag">{item.category}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campus;