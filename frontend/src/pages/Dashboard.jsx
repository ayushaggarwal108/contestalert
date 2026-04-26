import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ChatInterface from '../components/ChatInterface';
import './Dashboard.css';

const Dashboard = () => {
  const { user, connectCalendar } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, [page]);

  const fetchContests = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/contests?page=${page}&limit=10`);
      setContests(res.data.data);
    } catch (error) {
      console.error("Failed to fetch contests", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, { 
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      
      {!user?.hasCalendarAccess && (
        <div className="calendar-banner glass-panel">
          <div>
            <h3>Connect Google Calendar</h3>
            <p>To let AI schedule reminders for you, please grant Calendar permissions.</p>
          </div>
          <button className="btn btn-primary" onClick={connectCalendar}>Connect Now</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="contests-section">
          <h2>Upcoming Contests</h2>
          
          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            <div className="contests-grid">
              {contests.map((contest) => (
                <div key={contest._id} className="contest-card glass-panel animate-fade-in">
                  <div className={`platform-badge ${contest.platform.toLowerCase()}`}>
                    {contest.platform}
                  </div>
                  <h3>{contest.name}</h3>
                  <div className="contest-details">
                    <p><span>Start:</span> {formatDate(contest.startTime)}</p>
                    <p><span>Duration:</span> {Math.round(contest.duration / 60)} mins</p>
                  </div>
                  <a href={contest.url} target="_blank" rel="noreferrer" className="btn btn-outline full-width">
                    View Contest
                  </a>
                </div>
              ))}
            </div>
          )}
          
          <div className="pagination">
            <button 
              className="btn" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1}</span>
            <button className="btn" onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>

        <div className="chat-section">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
