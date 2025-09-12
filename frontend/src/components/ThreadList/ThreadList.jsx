// src/components/ThreadList/ThreadList.jsx
import React, { useState, useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { threadAPI } from '../../api/api';
import { useSocket } from '../../contexts/SocketContext';
import ThreadListItem from './ThreadListItem';

export default function ThreadList({ activeThreadId, onThreadSelect }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message:received', ({ message, threadId }) => {
        updateThreadWithNewMessage(threadId, message);
      });

      return () => {
        socket.off('message:received');
      };
    }
  }, [socket]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await threadAPI.getThreads();
      setThreads(response.data.threads);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateThreadWithNewMessage = (threadId, message) => {
    setThreads(prevThreads => {
      const updated = prevThreads.map(thread => {
        if (thread.id === parseInt(threadId)) {
          return {
            ...thread,
            lastMessage: message,
            updatedAt: new Date().toISOString(),
            unreadCount: thread.id === activeThreadId ? 0 : thread.unreadCount + 1
          };
        }
        return thread;
      });
      
      // Sort by updatedAt to bring the updated thread to top
      return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const markThreadAsRead = (threadId) => {
    setThreads(prevThreads =>
      prevThreads.map(thread =>
        thread.id === threadId
          ? { ...thread, unreadCount: 0 }
          : thread
      )
    );
  };

  const filteredThreads = threads.filter(thread =>
    thread.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (thread.lastMessage?.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleThreadSelect = (thread) => {
    markThreadAsRead(thread.id);
    onThreadSelect(thread);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chats</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No chats found' : 'No conversations yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Start a conversation from your contacts'}
            </p>
          </div>
        ) : (
          <div>
            {filteredThreads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                isActive={activeThreadId === thread.id}
                onClick={() => handleThreadSelect(thread)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}