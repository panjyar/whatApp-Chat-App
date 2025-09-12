// src/components/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { MessageSquare, Users, Menu, X } from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }) {
  const tabs = [
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageSquare,
      count: null
    },
    {
      id: 'contacts',
      name: 'Contacts',
      icon: Users,
      count: null
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900">WhapApp</h2>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={collapsed ? tab.name : undefined}
              >
                <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{tab.name}</span>
                    {tab.count && (
                      <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs rounded-full px-2 py-1">
                        {tab.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}