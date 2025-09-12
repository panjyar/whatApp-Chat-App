// src/components/ChatBubble/ChatBubble.jsx
import React from 'react';
import { Bot, Check, CheckCheck } from 'lucide-react';
import Avatar from '../Avatar/Avatar';

export default function ChatBubble({ message, isOwn, onMarkAsRead }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleBubbleClick = () => {
    if (!isOwn && message.status !== 'read') {
      onMarkAsRead();
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
      {!isOwn && (
        <Avatar
          src={message.sender.avatarUrl}
          name={message.sender.name}
          size="xs"
        />
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        <div
          onClick={handleBubbleClick}
          className={`
            relative px-4 py-2 rounded-2xl cursor-pointer
            ${message.type === 'assistant' 
              ? 'bg-purple-100 text-purple-900 border border-purple-200' 
              : isOwn
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }
            ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'}
          `}
        >
          {message.type === 'assistant' && (
            <div className="flex items-center space-x-1 mb-1">
              <Bot className="h-3 w-3" />
              <span className="text-xs font-medium">AI Assistant</span>
            </div>
          )}
          
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>
          
          <div className={`
            flex items-center justify-between mt-1 text-xs
            ${isOwn ? 'text-indigo-200' : 'text-gray-500'}
          `}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && message.status && (
              <span className="ml-2 flex items-center">
                {getStatusIcon(message.status)}
              </span>
            )}
          </div>
        </div>
        
        {message.status === 'sending' && isOwn && (
          <div className="flex justify-end mt-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {isOwn && (
        <Avatar
          src={message.sender.avatarUrl}
          name={message.sender.name}
          size="xs"
        />
      )}
    </div>
  );
}