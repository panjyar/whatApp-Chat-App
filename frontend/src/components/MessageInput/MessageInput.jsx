// src/components/MessageInput/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Smile, Paperclip, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      const messageData = {
        content: message.trim(),
        attachments: attachments
      };
      onSendMessage(messageData);
      setMessage('');
      setAttachments([]);
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
          <div className="flex-1">
            <span className="text-sm font-medium text-purple-900">Ask AI Assistant</span>
            <p className="text-xs text-purple-600 mt-0.5">
              Try: "summarize conversation", "suggest response", or ask a question
            </p>
          </div>
          <button
            onClick={onCloseAI}
            className="p-1 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 transition-colors"
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-10 right-0 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setMessage((prev) => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const newAttachments = files.map(file => ({
                  file,
                  preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                  type: file.type.startsWith('image/') ? 'image' : 'file',
                  name: file.name
                }));
                setAttachments(prev => [...prev, ...newAttachments]);
              }}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
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
          disabled={!message.trim() && attachments.length === 0}
          className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 px-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' ? (
                <div 
                  className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => setPreviewImage(attachment)}
                >
                  <img
                    src={attachment.preview}
                    alt={attachment.name}
                    className="w-full h-full object-cover hover:opacity-75 transition-opacity"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => {
                  setAttachments(prev => prev.filter((_, i) => i !== index));
                  if (attachment.preview) URL.revokeObjectURL(attachment.preview);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={previewImage.preview}
              alt={previewImage.name}
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
              <p className="text-sm truncate">{previewImage.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Character count */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span>{message.length}/1000</span>
          {attachments.length > 0 && (
            <span>• {attachments.length} file(s) attached</span>
          )}
        </div>
        {isTyping && (
          <span className="text-indigo-600">Typing...</span>
        )}
      </div>
    </div>
  );
}