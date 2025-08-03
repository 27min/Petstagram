import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ChatService } from '../../services/chatService';
import { useChat } from '../../hooks/useChat';
import { MessageList } from '../../components/chat/MessageList';
import { ChatInput } from '../../components/chat/ChatInput';

const ChatRoom = ({ roomId, currentUser, onPageChange, onMessageSent }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const {
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
  } = useChat(roomId, currentUser, onMessageSent);

  const handleProfileClick = (senderId, senderName) => {
    onPageChange('someoneInfo', {
        memberId: senderId,
        name: senderName
    });
  };

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current || isInitialLoad) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    if (scrollTop === 0 && hasMore && !isLoading) {
      loadPreviousMessages();
    }
    
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    setShouldScrollToBottom(isNearBottom);
  }, [hasMore, isLoading, isInitialLoad, loadPreviousMessages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    ChatService.sendTypingStatus(roomId, currentUser.id, true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      ChatService.sendTypingStatus(roomId, currentUser.id, false);
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;

    const now = new Date();
    const koreanTime = new Date(now.getTime() + (9*60*60*1000));
    const chatMessage = {
      roomId: roomId,
      senderId: currentUser.id,
      content: inputMessage,
      messageType: 'TEXT',
      senderName: currentUser.name,
      createdAt: koreanTime.toISOString()
    };

    try {
      ChatService.sendMessage(chatMessage);
      setInputMessage('');
      ChatService.sendTypingStatus(roomId, currentUser.id, false);
      setShouldScrollToBottom(true);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    let isSubscribed = true;
  
    ChatService.connect(
      roomId,
      handleMessage,
      handleTyping,
      () => {
        if (isSubscribed) {
          setIsConnected(true);
          setError(null);
          loadInitialMessages();
        }
      },
      setError
    );
  
    return () => {
      isSubscribed = false;
      ChatService.disconnect();
      setIsConnected(false);
    };
  }, [roomId, handleMessage, handleTyping, loadInitialMessages, setIsConnected, setError]);

  // 메시지가 업데이트될 때마다 스크롤
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom, scrollToBottom]);

  return (
    <div className="flex flex-col h-screen relative">
      {error && (
        <Alert variant="destructive" className="m-2 mt-16">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 mt-16 mb-20">
        {isLoading && (
          <div className="text-center py-2 text-gray-500">
            Loading previous messages...
          </div>
        )}
        
        <MessageList 
          messages={messages}
          currentUser={currentUser}
          isTyping={isTyping}
          onProfileClick={handleProfileClick}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <div className="fixed bottom-16 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-[1000] max-w-md mx-auto">
        <ChatInput 
          inputMessage={inputMessage}
          onInputChange={handleInputChange}
          onSubmit={sendMessage}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
};

export default ChatRoom;