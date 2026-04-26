import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your virtual assistant. Ask me about upcoming contests or tell me to schedule a reminder for you!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      // Send message and the previous conversation history (excluding the very first generic greeting to save tokens)
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_BASE_URL}/api/chat`, { 
        message: userMessage,
        history: historyPayload
      }, { withCredentials: true }); // Make sure cookies/session are sent!

      const { responseMessage } = res.data;
      
      setMessages(prev => [...prev, { role: 'assistant', text: responseMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Oops! I had trouble connecting to the server. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container glass-panel">
      <div className="chat-header">
        <h3>✨ System Assistant</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="message-bubble">
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message assistant">
            <div className="message-bubble typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g. Remind me about Leetcode contests..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary send-btn" disabled={isTyping || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
