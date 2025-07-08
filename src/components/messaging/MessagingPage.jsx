import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { messagingService } from '../../services/messagingService';
import ContactList from './ContactList';
import MessageThread from './MessageThread';

const MessagingPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getConversations(user?.role);
      if (response.success) {
        setConversations(response.data);
        // Auto-select first conversation if available
        if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0]);
        }
      } else {
        setError(response.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    const unreadMessages = conversation.messages
      .filter(msg => msg.sender_id !== user?.id && msg.status !== 'read')
      .map(msg => msg.id);
    
    if (unreadMessages.length > 0) {
      messagingService.markAsRead(conversation.id, user?.role, unreadMessages);
      
      // Update local state
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === conversation.id
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  unreadMessages.includes(msg.id) ? { ...msg, status: 'read' } : msg
                )
              }
            : conv
        )
      );
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!selectedConversation || !messageText.trim()) return;

    try {
      const response = await messagingService.sendMessage(
        selectedConversation.id,
        user?.role,
        {
          sender_id: user?.id,
          text: messageText.trim()
        }
      );

      if (response.success) {
        // Update the selected conversation with the new message
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, response.data]
        };
        
        setSelectedConversation(updatedConversation);
        
        // Update conversations list
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex">
        {/* Contact List Skeleton */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Message Thread Skeleton */}
        <div className="flex-1 bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs">
                  <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadConversations}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Contact List */}
      <div className="w-1/3 min-w-80">
        <ContactList
          contacts={conversations}
          selectedContact={selectedConversation}
          onSelectContact={handleSelectContact}
          currentUser={user}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1">
        <MessageThread
          conversation={selectedConversation}
          currentUser={user}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default MessagingPage;
