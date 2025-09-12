// src/components/ChatWindow/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bot, MoreVertical, X } from 'lucide-react';
import { threadAPI } from '../../api/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../Avatar/Avatar';
import MessageBubble from '../ChatBubble/ChatBubble';
import MessageInput from '../MessageInput/MessageInput';

export default function ChatWindow({ thread }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (thread) {
      fetchMessages();
    }
  }, [thread]);

  useEffect(() => {
    if (socket && thread) {
      socket.on('message:received', ({ message, threadId }) => {
        if (parseInt(threadId) === thread.id) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('typing', ({ threadId, userId, isTyping, user: typingUser }) => {
        if (parseInt(threadId) === thread.id && userId !== user.id) {
          setTyping(isTyping ? typingUser : null);
        }
      });

      socket.on('message:read', ({ messageId, threadId }) => {
        if (parseInt(threadId) === thread.id) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: 'read' }
                : msg
            )
          );
        }
      });

      return () => {
        socket.off('message:received');
        socket.off('typing');
        socket.off('message:read');
      };
    }
  }, [socket, thread, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await threadAPI.getMessages(thread.id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async (messageData) => {
    try {
      const { content, attachments } = messageData;
      
      // Handle attachments first
      const uploadedFiles = await Promise.all(
        attachments.map(async (attachment) => {
          const formData = new FormData();
          formData.append('file', attachment.file);
          // TODO: Implement file upload API endpoint
          // const response = await api.post('/files/upload', formData);
          // return response.data.url;
          return URL.createObjectURL(attachment.file); // Temporary for demo
        })
      );

      // Optimistically add message
      const tempMessage = {
        id: Date.now(),
        content,
        attachments: uploadedFiles.map((url, index) => ({
          url,
          type: attachments[index].type,
          name: attachments[index].name
        })),
        type: attachments.length > 0 ? 'media' : 'text',
        status: 'sending',
        createdAt: new Date().toISOString(),
        sender: user
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send via socket
      if (socket) {
        socket.emit('message:send', {
          threadId: thread.id,
          content,
          attachments: uploadedFiles
        });
      }

      // Remove temp message (real message will come via socket)
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && thread) {
      socket.emit('typing', {
        threadId: thread.id,
        isTyping
      });
    }
  };

  const handleAIRequest = async (prompt) => {
    try {
      setAiLoading(true);
      const response = await threadAPI.askAI(thread.id, prompt);
      // AI response will come through socket as a regular message
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await threadAPI.clearMessages(thread.id);
      setMessages([]);
      setShowOptionsMenu(false);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const handleBlockUser = async () => {
    try {
      await threadAPI.blockUser(thread.otherUser.id);
      setShowOptionsMenu(false);
      // Handle UI update for blocked user
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await threadAPI.markMessageAsRead(thread.id, messageId);
      if (socket) {
        socket.emit('message:read', {
          threadId: thread.id,
          messageId
        });
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  if (!thread) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <Avatar
              src={thread.otherUser.avatarUrl}
              name={thread.otherUser.name}
              size="md"
              showStatus={true}
              isOnline={false}
            />
            <div>
              <h3 className="font-medium text-gray-900">{thread.otherUser.name}</h3>
              <p className="text-sm text-gray-500">
                {typing ? `${typing.name} is typing...` : 'Click to view profile'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIPrompt(!showAIPrompt)}
              className={`p-2 rounded-lg transition-colors ${
                showAIPrompt 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Ask AI Assistant"
            >
              <Bot className="h-5 w-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {showOptionsMenu && (
                <div 
                  ref={optionsMenuRef}
                  className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <button
                    onClick={() => setShowAIPrompt(true)}
                    disabled={aiLoading}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Bot className="h-4 w-4" />
                    <span>{aiLoading ? 'AI thinking...' : 'Ask AI Assistant'}</span>
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-yellow-600"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Chat</span>
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                  >
                    <X className="h-4 w-4" />
                    <span>Block User</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender.id === user.id}
                  onMarkAsRead={() => markMessageAsRead(message.id)}
                />
              ))}
              {typing && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Avatar src={typing.avatarUrl} name={typing.name} size="xs" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white">
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            showAIPrompt={showAIPrompt}
            onAIRequest={handleAIRequest}
            onCloseAI={() => setShowAIPrompt(false)}
          />
        </div>
      </div>
    );
}
