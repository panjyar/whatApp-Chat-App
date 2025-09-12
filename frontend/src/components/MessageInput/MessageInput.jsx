// src/components/MessageInput/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Smile, Paperclip } from 'lucide-react';

export default function MessageInput({ 
  onSendMessage, 
  onTyping, 
  showAIPrompt, 
  onAIRequest, 
  onCloseAI 
}) {
  const [message, setMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      handleTypingStop();
    }
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      onAIRequest(aiPrompt.trim());
      setAiPrompt('');
      onCloseAI();
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape' && showAIPrompt) {
      onCloseAI();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (showAIPrompt) {
    return (
      <div className="p-4 border-t-2 border-purple-200 bg-purple-50">
        <div className="flex items-center space-x-2 mb-3">
          <Bot className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Ask AI Assistant</span>
          <button
            onClick={onCloseAI}
            className="ml-auto p-1 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleAISubmit} className="space-y-3">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask the AI assistant to help with your conversation..."
            className="w-full px-3 py-2 border border-purple-300 rounded-lg resize-none focus:ring-purple-500 focus:border-purple-500 bg-white"
            rows="2"
            maxLength="500"
            onKeyDown={handleKeyDown}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-600">
              {aiPrompt.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={!aiPrompt.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:ring-indigo-500 focus:border-indigo-500 max-h-32"
            rows="1"
            maxLength="1000"
          />
          
          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      
      {/* Character count */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>{message.length}/1000</span>
        {isTyping && (
          <span className="text-indigo-600">Typing...</span>
        )}
      </div>
    </div>
  );
}