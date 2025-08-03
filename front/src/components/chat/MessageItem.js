import React from 'react';
import { formatMessageTime } from '../../utils/messageUtils';

export const MessageItem = ({ message, isCurrentUser, onProfileClick }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isCurrentUser && (
        <div 
          className="flex-shrink-0 mr-2 cursor-pointer" 
          onClick={() => onProfileClick(message.senderId, message.senderName)}
        >
          <img 
            src={message.senderProfileUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(message.senderName)}`}
            alt={`${message.senderName}의 프로필`}
            className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        </div>
      )}
      
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
      }`}>
        <div>{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};