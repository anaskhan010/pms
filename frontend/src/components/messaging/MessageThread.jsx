import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from '../common';

const MessageThread = ({ conversation, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (fileType?.includes('doc')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-sm font-medium text-teal-700">
              {conversation.participant?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{conversation.participant?.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{conversation.participant?.role}</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              conversation.participant?.status === 'online' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {conversation.participant?.status || 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation.messages?.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUser?.id;
          const showDate = index === 0 || 
            formatDate(message.timestamp) !== formatDate(conversation.messages[index - 1]?.timestamp);

          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 text-xs bg-white rounded-full text-gray-500 border">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}

              {/* Message */}
              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  {/* Text Message */}
                  {message.text && (
                    <p className="text-sm">{message.text}</p>
                  )}

                  {/* Image Attachment */}
                  {message.image && (
                    <div className="mt-2">
                      <img
                        src={message.image.url}
                        alt={message.image.name}
                        className="max-w-full h-auto rounded cursor-pointer hover:opacity-90"
                        onClick={() => setShowImagePreview(message.image)}
                      />
                      <p className="text-xs mt-1 opacity-75">{message.image.name}</p>
                    </div>
                  )}

                  {/* Document Attachment */}
                  {message.document && (
                    <div 
                      className="mt-2 p-3 bg-black bg-opacity-10 rounded cursor-pointer hover:bg-opacity-20"
                      onClick={() => setShowDocumentPreview(message.document)}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(message.document.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{message.document.name}</p>
                          <p className="text-xs opacity-75">{message.document.size}</p>
                        </div>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Message Status */}
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    isCurrentUser ? 'text-teal-200' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {isCurrentUser && (
                      <div className="flex space-x-1">
                        {message.status === 'sent' && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {message.status === 'delivered' && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {message.status === 'read' && (
                          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
            />
          </div>
          <Button type="submit" disabled={!newMessage.trim()}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImagePreview(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={showImagePreview.url}
              alt={showImagePreview.name}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
              {showImagePreview.name}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showDocumentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{showDocumentPreview.name}</h3>
              <button
                onClick={() => setShowDocumentPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                {getFileIcon(showDocumentPreview.type)}
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">{showDocumentPreview.name}</h4>
              <p className="text-gray-500 mb-4">Size: {showDocumentPreview.size}</p>
              <div className="flex justify-center space-x-3">
                <Button variant="primary">Download</Button>
                <Button variant="secondary">View</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageThread;
