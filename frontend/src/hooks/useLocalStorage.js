// src/pages/App.jsx - Updated with complete chat interface
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import Login from './Login';
import Dashboard from './Dashboard';

// Import all components
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';
import ThreadList from '../components/ThreadList/ThreadList';
import ContactsList from '../components/Contacts/ContactsList';
import ChatWindow from '../components/ChatWindow/ChatWindow';

function MessageView() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedThread, setSelectedThread] = useState(null);

  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    setActiveTab('chat'); // Auto-switch to chat tab when selecting a thread
  };

  const handleStartChat = (thread) => {
    setSelectedThread(thread);
    setActiveTab('chat'); // Switch to chat view when starting a new chat
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar currentView="message" onViewChange={() => {}} />

        {/* Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Thread List or Contacts */}
          <div className="w-80 border-r border-gray-200 bg-white">
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
          <div className="flex-1">
            <ChatWindow thread={selectedThread} />
          </div>
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

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {currentView === 'dashboard' ? (
              <div className="h-screen flex flex-col">
                <Topbar 
                  currentView={currentView} 
                  onViewChange={handleViewChange} 
                />
                <div className="flex-1">
                  <Dashboard />
                </div>
              </div>
            ) : (
              <MessageView />
            )}
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