import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Users, Search, MessageCircle, Bot } from 'lucide-react';
import { threadAPI } from '../api/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeChats: 0,
    contacts: 0,
    messagesSent: 0,
    aiMessages: 0
  });

  useEffect(() => {
    // Fetch stats from the threads API
    const fetchStats = async () => {
      try {
        const response = await threadAPI.getThreads();
        const threads = response.data.threads;
        
        // Calculate stats
        setStats({
          activeChats: threads.length,
          contacts: threads.length, // This should ideally come from contacts API
          messagesSent: threads.reduce((total, thread) => 
            total + (thread.lastMessage ? 1 : 0), 0),
          aiMessages: threads.reduce((total, thread) => 
            total + (thread.lastMessage?.type === 'assistant' ? 1 : 0), 0)
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Send and receive messages instantly with your contacts",
      color: "blue",
      status: "Active"
    },
    {
      icon: Users,
      title: "Contact Management",
      description: "Add and manage your contacts easily",
      color: "green",
      status: "Active"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get help from our AI assistant in your conversations",
      color: "indigo",
      status: "Active"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Search through messages and find conversations quickly",
      color: "purple",
      status: "Active"
    }
  ];

  return (
    <div className="flex-1 bg-gray-50 p-8">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Welcome back, {user?.name}!
        </h1>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 bg-${feature.color}-100 rounded-lg`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600">{feature.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Activity Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.activeChats}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">Active Chats</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.contacts}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">Contacts</p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold text-indigo-600">{stats.messagesSent}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">Messages Sent</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.aiMessages}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">AI Interactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
