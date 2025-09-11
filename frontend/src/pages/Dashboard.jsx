import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Users, Search, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">WhapApp Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Chats</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Start conversations with your contacts and send real-time messages.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            </div>
          </div>

          {/* Contacts Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Manage your contact list and add new people to chat with.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            </div>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Search</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Search through your messages and find specific conversations.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Active Chats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
