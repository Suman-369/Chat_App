import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChatMobileBar.css';
import './ChatLayout.css';

const ChatMobileBar = ({ onToggleSidebar, onNewChat }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="chat-mobile-bar">
      <button className="chat-icon-btn" onClick={onToggleSidebar} aria-label="Toggle chat history">☰</button>
      <h1 className="chat-app-title">Chat</h1>
      <div className="chat-mobile-bar-right">
        <button className="chat-icon-btn" onClick={onNewChat} aria-label="New chat">＋</button>
        <button className="chat-icon-btn logout-btn" onClick={handleLogout} aria-label="Logout">↩</button>
      </div>
    </header>
  );
};

export default ChatMobileBar;
