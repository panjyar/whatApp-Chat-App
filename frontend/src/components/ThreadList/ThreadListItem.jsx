// src/components/ThreadList/ThreadListItem.jsx
import React from 'react';
import Avatar from '../Avatar/Avatar';

export default function ThreadListItem({ thread, isActive, onClick }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (now - messageDate < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return 'No messages yet';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const getMessagePreview = () => {
    if (!thread.lastMessage) return 'Start a conversation';
    
    if (thread.lastMessage.type === 'assistant') {
      return 'AI: ' + truncateMessage(thread.lastMessage.content);
    }
    
    return truncateMessage(thread.lastMessage.content);
  };

  // Early return if thread or otherUser is undefined
  if (!thread || !thread.otherUser) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-colors border-l-4
        ${isActive 
          ? 'bg-indigo-50 border-indigo-500' 
          : 'hover:bg-gray-50 border-transparent'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          src={thread.otherUser.avatarUrl || ''}
          name={thread.otherUser.name || 'Unknown'}
          size="md"
          showStatus={true}
          isOnline={false} // This would need to be passed from parent based on online status
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-sm font-medium truncate ${
              isActive ? 'text-indigo-900' : 'text-gray-900'
            }`}>
              {thread.otherUser.name}
            </p>
            <div className="flex items-center space-x-2">
              {thread.lastMessage && (
                <span className="text-xs text-gray-500">
                  {formatTime(thread.lastMessage.createdAt)}
                </span>
              )}
              {thread.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                  {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <p className={`text-sm truncate ${
            thread.unreadCount > 0 
              ? 'text-gray-900 font-medium' 
              : 'text-gray-600'
          }`}>
            {getMessagePreview()}
          </p>
          
          {thread.lastMessage && (
            <div className="flex items-center mt-1 space-x-2">
              {thread.lastMessage.status && (
                <span className={`text-xs ${
                  thread.lastMessage.status === 'read' 
                    ? 'text-blue-500' 
                    : thread.lastMessage.status === 'delivered'
                    ? 'text-gray-500'
                    : 'text-gray-400'
                }`}>
                  {thread.lastMessage.status === 'read' && '✓✓'}
                  {thread.lastMessage.status === 'delivered' && '✓'}
                  {thread.lastMessage.status === 'sent' && '→'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}