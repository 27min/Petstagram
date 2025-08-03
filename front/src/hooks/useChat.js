import { useState, useCallback, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { sortMessagesByTime } from '../utils/messageUtils';

export const useChat = (roomId, currentUser, onMessageSent) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const typingTimeoutRef = useRef(null);

  const handleMessage = useCallback((message) => {
    const receivedMessage = JSON.parse(message.body);
    setMessages(prevMessages => {
      const isDuplicate = prevMessages.some(msg => 
        msg.createdAt === receivedMessage.createdAt && 
        msg.senderId === receivedMessage.senderId &&
        msg.content === receivedMessage.content
      );
      if (isDuplicate) return prevMessages;
      
      const newMessages = [...prevMessages, receivedMessage];
      return sortMessagesByTime(newMessages);
    });
  }, []);

  const handleTyping = useCallback((message) => {
    const { userId, isTyping } = JSON.parse(message.body);
    if (userId !== currentUser.id) {
      setIsTyping(isTyping);
    }
  }, [currentUser.id]);

  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ChatService.loadRecentMessages(roomId);
      const sortedMessages = sortMessagesByTime(response.messages);
      setMessages(sortedMessages);
      setHasMore(response.hasMore);
      if (sortedMessages.length > 0) {
        setLastMessageTime(sortedMessages[0].createdAt);
      }
    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [roomId]);

  const loadPreviousMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    try {
      setIsLoading(true);
      const response = await ChatService.loadPreviousMessages(roomId, lastMessageTime);
      
      if (response.messages.length === 0) {
        setHasMore(false);
        return;
      }
  
      setMessages(prevMessages => {
        const newMessages = response.messages.filter(newMsg => 
          !prevMessages.some(existingMsg => 
            existingMsg.createdAt === newMsg.createdAt && 
            existingMsg.senderId === newMsg.senderId &&
            existingMsg.content === newMsg.content
          )
        );
        
        if (newMessages.length === 0) return prevMessages;
        
        const allMessages = [...newMessages, ...prevMessages];
        return sortMessagesByTime(allMessages);
      });

      setHasMore(response.hasMore);
      if (response.messages.length > 0) {
        setLastMessageTime(response.messages[0].createdAt);
      }

    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, lastMessageTime, isLoading, hasMore]);

  return {
    messages,
    isConnected,
    error,
    isTyping,
    isLoading,
    hasMore,
    isInitialLoad,
    handleMessage,
    handleTyping,
    loadInitialMessages,
    loadPreviousMessages,
    setIsConnected,
    setError,
    typingTimeoutRef
  };
};