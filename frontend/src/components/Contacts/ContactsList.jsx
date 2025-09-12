// src/components/Contacts/ContactsList.jsx
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, MessageCircle } from 'lucide-react';
import { contactAPI, threadAPI } from '../../api/api';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../Avatar/Avatar';
import AddContactModal from './AddContactModal';

export default function ContactsList({ onStartChat }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { socket } = useSocket();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('user:online', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      socket.on('user:offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      return () => {
        socket.off('user:online');
        socket.off('user:offline');
      };
    }
  }, [socket]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getContacts();
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (contactEmail) => {
    try {
      await contactAPI.addContact(contactEmail);
      await fetchContacts();
      setShowAddModal(false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add contact'
      };
    }
  };

  const handleRemoveContact = async (contactId) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      try {
        await contactAPI.removeContact(contactId);
        await fetchContacts();
      } catch (error) {
        console.error('Failed to remove contact:', error);
      }
    }
  };

  const handleStartChat = async (contact) => {
    try {
      const response = await threadAPI.createThread(contact.contact.id);
      onStartChat(response.data.thread);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No contacts found' : 'No contacts yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Add someone to start chatting'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => {
              const isOnline = onlineUsers.has(contact.contact.id);
              
              return (
                <ContactItem
                  key={contact.contact.id}
                  contact={contact.contact}
                  isOnline={isOnline}
                  lastSeen={formatLastSeen(contact.contact.lastSeen)}
                  onStartChat={() => handleStartChat(contact)}
                  onRemove={() => handleRemoveContact(contact.contact.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddContact}
        />
      )}
    </div>
  );
}

// ContactItem component
function ContactItem({ contact, isOnline, lastSeen, onStartChat, onRemove }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <Avatar
          src={contact.avatarUrl}
          name={contact.name}
          size="md"
          showStatus={true}
          isOnline={isOnline}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {contact.name}
            </p>
            <div className="flex items-center space-x-1">
              <button
                onClick={onStartChat}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Start chat"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove contact"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate">{contact.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isOnline ? 'Online' : `Last seen ${lastSeen}`}
          </p>
        </div>
      </div>
    </div>
  );
}