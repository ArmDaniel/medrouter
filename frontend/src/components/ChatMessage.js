import React from 'react';
import styles from './ChatMessage.module.css'; // We'll create this CSS module

const ChatMessage = ({ message, currentUserId }) => {
  const { senderid, senderrole, content, timestamp } = message;
  const isCurrentUser = senderid === currentUserId;

  // Basic date formatting
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // fallback if date is invalid
    }
  };

  return (
    <div className={`${styles.message} ${isCurrentUser ? styles.currentUser : styles.otherUser}`}>
      <div className={styles.messageInfo}>
        <span className={styles.sender}>{isCurrentUser ? 'You' : `${senderrole} (${senderid.substring(0,8)}...)`}</span>
        <span className={styles.timestamp}>{formatDate(timestamp)}</span>
      </div>
      <div className={styles.content}>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
