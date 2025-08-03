import React from 'react';
import { Send, Image, Paperclip } from 'lucide-react';

export const ChatInput = ({ 
  inputMessage, 
  onInputChange, 
  onSubmit, 
  isConnected 
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 w-full">
      <div className="flex items-center space-x-2">
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
          <Image className="w-6 h-6" />
        </button>
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
          <Paperclip className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={inputMessage}
          onChange={onInputChange}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};