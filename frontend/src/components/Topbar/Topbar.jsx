// src/components/Topbar/Topbar.jsx
import React from 'react';
import { MessageSquare, LayoutDashboard, LogOut, User, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../Avatar/Avatar';

export default function Topbar({ currentView, onViewChange }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  const views = [
    {
      id: 'message',
      name: 'Message',
      icon: MessageSquare
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard
    }
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Navigation */}
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-2">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              
              return (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {view.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: User info and controls */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            {connected ? (
              <div className="flex items-center text-green-600" title="Connected">
                <Wifi className="h-4 w-4" />
                <span className="text-xs ml-1">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600" title="Disconnected">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs ml-1">Offline</span>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.avatarUrl}
              name={user?.name || ''}
              size="sm"
              showStatus={true}
              isOnline={connected}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}