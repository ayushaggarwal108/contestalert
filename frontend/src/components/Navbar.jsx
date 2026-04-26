import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <span className="gradient-text font-bold">ContestAlert</span>
      </div>
      
      <div className="nav-actions">
        {user && (
          <>
            <div className="user-profile">
              <img src={user.avatarUrl} alt="avatar" className="avatar" />
              <span className="user-name">{user.name}</span>
            </div>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
