// src/pages/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SocketProvider, useSocket } from '../contexts/SocketContext';
import Login from './Login';
import Dashboard from './Dashboard';

// Import all components
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';
import ThreadList from '../components/ThreadList/ThreadList';
import ContactsList from '../components/Contacts/ContactsList';
import ChatWindow from '../components/ChatWindow/ChatWindow';

// Import API
import { threadAPI } from '../api/api';


function MessageView() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedThread, setSelectedThread] = useState(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
  };

  const handleStartChat = async (contact) => {
    try {
      const response = await threadAPI.createThread(contact.id);
      const newThread = response.data.thread;
      setSelectedThread(newThread);
      setActiveTab('chat');
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  return (
    <div className="flex bg-gray-100 h-full">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Thread List or Contacts */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          {activeTab === 'chat' ? (
            <ThreadList
              activeThreadId={selectedThread?.id}
              onThreadSelect={handleThreadSelect}
            />
          ) : (
            <ContactsList onStartChat={handleStartChat} />
          )}
        </div>

        {/* Right Panel - Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            thread={selectedThread}
            currentUser={user}
            socket={socket}
          />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const [currentView, setCurrentView] = useState('message');
  const { isAuthenticated } = useAuth();

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <div className="h-screen flex flex-col">
              <Topbar 
                currentView={currentView} 
                onViewChange={handleViewChange} 
              />
              <div className="flex-1 overflow-hidden">
                {currentView === 'dashboard' ? (
                  <Dashboard />
                ) : (
                  <MessageView />
                )}
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}