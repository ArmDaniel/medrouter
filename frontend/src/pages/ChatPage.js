import React, { useState, useEffect, useCallback } from 'react';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import useAuthStore from '../store/authStore';
import chatService from '../services/chatService'; // USING THE ACTUAL SERVICE
import styles from './ChatPage.module.css';

const ChatPage = () => {
  const HARDCODED_CASE_ID = 'test-case-123'; // TODO: Replace with dynamic case ID selection

  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  const { user, tokens } = useAuthStore(state => ({ // Get user and tokens from Zustand store
    user: state.user,
    tokens: state.tokens
  }));

  const loadMessages = useCallback(async () => {
    if (!user || !tokens?.accessToken) { // Check for accessToken specifically
      setError("User not authenticated or token missing.");
      return;
    }
    setIsLoadingMessages(true);
    setError(null);
    try {
      const fetchedMessages = await chatService.getChatMessages(HARDCODED_CASE_ID); // Token is handled by service
      setMessages(fetchedMessages || []); // Service returns chatHistory array
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError(err.message || 'Failed to load messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, tokens?.accessToken]); // Dependency on accessToken to re-fetch if token changes (e.g. after refresh)

  useEffect(() => {
    if (user && tokens?.accessToken) { // Only load messages if authenticated
        loadMessages();
    }
  }, [loadMessages, user, tokens?.accessToken]);

  const handleSendMessage = async (content) => {
    if (!user || !tokens?.accessToken) {
      setError("User not authenticated. Cannot send message.");
      return;
    }
    setIsSendingMessage(true);
    setError(null);
    try {
      const messageData = {
        content: content,
        // senderId and senderRole are derived from JWT by the backend
      };
      const response = await chatService.sendChatMessage(HARDCODED_CASE_ID, messageData); // Token handled by service
      // Backend currently returns { message: '...', chatHistory: [...] }
      // So we can update the messages with the full history.
      setMessages(response.chatHistory || []);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!user) {
    return <div className={styles.container}><p>Please log in to use the chat.</p></div>;
  }
  if (!tokens?.accessToken) { // Additional check for token presence if user object exists but token doesn't
    return <div className={styles.container}><p>Authentication token is missing. Please log in again.</p></div>;
  }


  return (
    <div className={styles.chatPageContainer}>
      <h2 className={styles.chatHeader}>Chat for Case: {HARDCODED_CASE_ID}</h2>
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
      <MessageList
        messages={messages}
        currentUserId={user.userid} // Pass current user's ID for styling own messages
        isLoading={isLoadingMessages}
      />
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isSendingMessage}
      />
    </div>
  );
};

export default ChatPage;
