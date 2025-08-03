import React from 'react';
import { MessageItem } from './MessageItem';

export const MessageList = ({ 
  messages, 
  currentUser, 
  isTyping, 
  onProfileClick, 
  messagesEndRef 
}) => {
  return (
    <>
      {messages.map((msg, index) => (
        <MessageItem 
          key={index}
          message={msg}
          isCurrentUser={msg.senderId === currentUser.id}
          onProfileClick={onProfileClick}
        />
      ))}
      {isTyping && (
        <div className="text-sm text-gray-500 italic">
          Someone is typing...
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
};