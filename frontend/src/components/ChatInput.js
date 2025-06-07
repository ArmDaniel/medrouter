import React, { useState } from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage(''); // Clear input after sending
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatInputForm}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className={styles.inputField}
        disabled={isLoading}
      />
      <button type="submit" className={styles.sendButton} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default ChatInput;
