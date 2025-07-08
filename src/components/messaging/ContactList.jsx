import React, { useState, useMemo } from "react";

const ContactList = ({
  contacts,
  selectedContact,
  onSelectContact,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Stable callback function to prevent re-renders
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "No messages yet";
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage.text) {
      return lastMessage.text.length > 50
        ? lastMessage.text.substring(0, 50) + "..."
        : lastMessage.text;
    }

    if (lastMessage.image) {
      return "📷 Photo";
    }

    if (lastMessage.document) {
      return "📄 Document";
    }

    return "Message";
  };

  const getUnreadCount = (conversation) => {
    if (!conversation.messages) return 0;

    return conversation.messages.filter(
      (message) =>
        message.sender_id !== currentUser?.id && message.status !== "read"
    ).length;
  };

  // Memoized filtered contacts to prevent unnecessary re-renders
  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.participant?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        contact.participant?.role
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const sortedContacts = useMemo(() => {
    return filteredContacts.sort((a, b) => {
      const aLastMessage = a.messages?.[a.messages.length - 1];
      const bLastMessage = b.messages?.[b.messages.length - 1];

      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;

      return (
        new Date(bLastMessage.timestamp) - new Date(aLastMessage.timestamp)
      );
    });
  }, [filteredContacts]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
        />
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {sortedContacts.length === 0 ? (
          <div className="p-4 text-center">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const unreadCount = getUnreadCount(contact);
              const lastMessage =
                contact.messages?.[contact.messages.length - 1];

              return (
                <div
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-teal-50 border-r-2 border-teal-500" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-700">
                          {contact.participant?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      {/* Online Status */}
                      {contact.participant?.status === "online" && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-sm font-medium truncate ${
                            unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {contact.participant?.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-teal-600 rounded-full">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-sm truncate ${
                            unreadCount > 0
                              ? "text-gray-900 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {getLastMessagePreview(contact)}
                        </p>
                      </div>

                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {contact.participant?.role}
                        </span>
                        {contact.participant?.property && (
                          <span className="ml-2 text-xs text-gray-500 truncate">
                            {contact.participant.property}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Message Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Message
        </button>
      </div>
    </div>
  );
};

export default ContactList;
