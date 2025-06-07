import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import styles from './MessageList.module.css';

const MessageList = ({ messages, currentUserId, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages change

  if (isLoading) {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  if (!messages || messages.length === 0) {
    return <div className={styles.noMessages}>No messages yet. Start the conversation!</div>;
  }

  return (
    <div className={styles.messageListContainer}>
      {messages.map((msg, index) => (
        // Assuming messages have a unique 'messageId' from backend (added in backend controller)
        // If not, ensure 'msg.timestamp' + index or similar unique key is used.
        <ChatMessage key={msg.messageid || `msg-${index}`} message={msg} currentUserId={currentUserId} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
