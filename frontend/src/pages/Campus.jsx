import React, { useState } from 'react';
import axios from 'axios';

const Campus = () => {
  const [view, setView] = useState('menu');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const openCategory = async (category) => {
    setLoading(true);
    setView(category);
    try {
      const res = await axios.get(`http://localhost:8000/api/${category}`);
      setItems(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setItems([]);
    }
    setLoading(false);
  };

  if (view === 'menu') {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>ASTU Campus</h2>
        <p style={styles.subtitle}>Explore everything happening at Adama Science and Technology University</p>
        
        <div style={styles.cardContainer}>
          {/* Events Card */}
          <div style={styles.card}>
            <div style={{...styles.iconBox, backgroundColor: '#eff6ff', color: '#3b82f6'}}>📅</div>
            <h3 style={styles.cardTitle}>Events</h3>
            <button style={styles.navBtn} onClick={() => openCategory('events')}>
              View Events
            </button>
          </div>

          {/* Student Clubs Card */}
          <div style={styles.card}>
            <div style={{...styles.iconBox, backgroundColor: '#faf5ff', color: '#a855f7'}}>👥</div>
            <h3 style={styles.cardTitle}>Student Clubs</h3>
            <button style={{...styles.navBtn, backgroundColor: '#8b5cf6'}} onClick={() => openCategory('clubs')}>
              See List of Clubs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView('menu')}>← Back to Campus</button>
      <h3 style={{...styles.title, fontSize: '24px'}}>{view === 'events' ? "Upcoming Events" : "Student Clubs"}</h3>
      <div style={styles.itemList}>
        {loading ? <p>Loading...</p> : items.map(item => (
          <div key={item._id} style={styles.itemRow}>
            <div>
              <h4 style={{margin: 0}}>{item.title || item.name}</h4>
              <p style={{color: '#666', fontSize: '14px'}}>{item.description}</p>
            </div>
            <button style={styles.actionBtn}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎨 Integrated Styles to fix your design instantly
const styles = {
  page: { padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', minHeight: '100vh' },
  title: { fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' },
  subtitle: { color: '#64748b', fontStyle: 'italic', marginBottom: '40px' },
  cardContainer: { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '300px', textAlign: 'center' },
  iconBox: { width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 20px' },
  cardTitle: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' },
  navBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  backBtn: { background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' },
  itemList: { maxWidth: '800px', margin: '0 auto', textAlign: 'left' },
  itemRow: { backgroundColor: 'white', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  actionBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }
};

export default Campus;