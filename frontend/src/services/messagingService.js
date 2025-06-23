/**
 * Messaging Service
 * Provides mock data and API simulation for messaging features
 */

// Mock delay to simulate API calls
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock conversations data
const mockConversations = {
  // Admin conversations
  admin: [
    {
      id: 1,
      participant: {
        id: 2,
        name: "Ahmed Al-Rashid",
        role: "owner",
        status: "online",
        property: "Al-Noor Complex"
      },
      messages: [
        {
          id: 1,
          sender_id: 2,
          text: "Hello, I need to discuss the maintenance budget for this quarter.",
          timestamp: "2024-02-20T09:30:00Z",
          status: "read"
        },
        {
          id: 2,
          sender_id: 1,
          text: "Of course! I've prepared the quarterly maintenance report. Let me share it with you.",
          timestamp: "2024-02-20T09:32:00Z",
          status: "read"
        },
        {
          id: 3,
          sender_id: 1,
          document: {
            name: "Q1_Maintenance_Report_2024.pdf",
            type: "application/pdf",
            size: "2.3 MB",
            url: "/documents/maintenance_report.pdf"
          },
          timestamp: "2024-02-20T09:33:00Z",
          status: "read"
        },
        {
          id: 4,
          sender_id: 2,
          text: "Thank you! I'll review this and get back to you with any questions.",
          timestamp: "2024-02-20T09:35:00Z",
          status: "read"
        },
        {
          id: 5,
          sender_id: 1,
          text: "Perfect. Also, I wanted to update you on the new tenant applications we received.",
          timestamp: "2024-02-20T14:20:00Z",
          status: "delivered"
        }
      ]
    },
    {
      id: 2,
      participant: {
        id: 3,
        name: "Sarah Johnson",
        role: "tenant",
        status: "offline",
        property: "Al-Noor Complex - Unit A-205"
      },
      messages: [
        {
          id: 6,
          sender_id: 3,
          text: "Hi, I'm having an issue with the air conditioning in my unit. It's not cooling properly.",
          timestamp: "2024-02-19T16:45:00Z",
          status: "read"
        },
        {
          id: 7,
          sender_id: 1,
          text: "I'm sorry to hear about the AC issue. I'll arrange for a technician to visit your unit. Are you available tomorrow morning?",
          timestamp: "2024-02-19T17:10:00Z",
          status: "read"
        },
        {
          id: 8,
          sender_id: 3,
          text: "Yes, I'll be available between 9 AM and 12 PM. Thank you for the quick response!",
          timestamp: "2024-02-19T17:15:00Z",
          status: "read"
        },
        {
          id: 9,
          sender_id: 3,
          image: {
            name: "AC_unit_issue.jpg",
            url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
            size: "1.2 MB"
          },
          text: "Here's a photo of the AC unit showing the issue",
          timestamp: "2024-02-19T17:16:00Z",
          status: "read"
        },
        {
          id: 10,
          sender_id: 1,
          text: "Perfect! I've scheduled the technician for tomorrow at 10 AM. They'll contact you 30 minutes before arrival.",
          timestamp: "2024-02-19T17:30:00Z",
          status: "read"
        }
      ]
    }
  ],

  // Owner conversations
  owner: [
    {
      id: 3,
      participant: {
        id: 1,
        name: "Admin Support",
        role: "admin",
        status: "online"
      },
      messages: [
        {
          id: 11,
          sender_id: 2,
          text: "Hello, I need to discuss the maintenance budget for this quarter.",
          timestamp: "2024-02-20T09:30:00Z",
          status: "read"
        },
        {
          id: 12,
          sender_id: 1,
          text: "Of course! I've prepared the quarterly maintenance report. Let me share it with you.",
          timestamp: "2024-02-20T09:32:00Z",
          status: "read"
        },
        {
          id: 13,
          sender_id: 1,
          document: {
            name: "Q1_Maintenance_Report_2024.pdf",
            type: "application/pdf",
            size: "2.3 MB",
            url: "/documents/maintenance_report.pdf"
          },
          timestamp: "2024-02-20T09:33:00Z",
          status: "read"
        }
      ]
    },
    {
      id: 4,
      participant: {
        id: 3,
        name: "Sarah Johnson",
        role: "tenant",
        status: "offline",
        property: "Unit A-205"
      },
      messages: [
        {
          id: 14,
          sender_id: 3,
          text: "Hello Mr. Al-Rashid, I wanted to discuss the lease renewal for my unit.",
          timestamp: "2024-02-18T14:20:00Z",
          status: "read"
        },
        {
          id: 15,
          sender_id: 2,
          text: "Hello Sarah! I'd be happy to discuss the renewal. Your lease expires in June, correct?",
          timestamp: "2024-02-18T14:45:00Z",
          status: "read"
        },
        {
          id: 16,
          sender_id: 3,
          text: "Yes, that's right. I'm very happy with the unit and would like to renew for another year.",
          timestamp: "2024-02-18T15:00:00Z",
          status: "read"
        },
        {
          id: 17,
          sender_id: 2,
          text: "Excellent! I'll prepare the renewal documents. The rent will increase by 5% as per market rates.",
          timestamp: "2024-02-18T15:30:00Z",
          status: "read"
        },
        {
          id: 18,
          sender_id: 2,
          document: {
            name: "Lease_Renewal_Agreement_2024.pdf",
            type: "application/pdf",
            size: "1.8 MB",
            url: "/documents/lease_renewal.pdf"
          },
          text: "Here's the renewal agreement for your review",
          timestamp: "2024-02-18T16:00:00Z",
          status: "delivered"
        }
      ]
    }
  ],

  // Tenant conversations
  tenant: [
    {
      id: 5,
      participant: {
        id: 2,
        name: "Ahmed Al-Rashid",
        role: "owner",
        status: "online"
      },
      messages: [
        {
          id: 19,
          sender_id: 3,
          text: "Hello Mr. Al-Rashid, I wanted to discuss the lease renewal for my unit.",
          timestamp: "2024-02-18T14:20:00Z",
          status: "read"
        },
        {
          id: 20,
          sender_id: 2,
          text: "Hello Sarah! I'd be happy to discuss the renewal. Your lease expires in June, correct?",
          timestamp: "2024-02-18T14:45:00Z",
          status: "read"
        },
        {
          id: 21,
          sender_id: 3,
          text: "Yes, that's right. I'm very happy with the unit and would like to renew for another year.",
          timestamp: "2024-02-18T15:00:00Z",
          status: "read"
        },
        {
          id: 22,
          sender_id: 2,
          document: {
            name: "Lease_Renewal_Agreement_2024.pdf",
            type: "application/pdf",
            size: "1.8 MB",
            url: "/documents/lease_renewal.pdf"
          },
          text: "Here's the renewal agreement for your review",
          timestamp: "2024-02-18T16:00:00Z",
          status: "delivered"
        }
      ]
    },
    {
      id: 6,
      participant: {
        id: 1,
        name: "Property Management",
        role: "admin",
        status: "online"
      },
      messages: [
        {
          id: 23,
          sender_id: 3,
          text: "Hi, I'm having an issue with the air conditioning in my unit. It's not cooling properly.",
          timestamp: "2024-02-19T16:45:00Z",
          status: "read"
        },
        {
          id: 24,
          sender_id: 1,
          text: "I'm sorry to hear about the AC issue. I'll arrange for a technician to visit your unit. Are you available tomorrow morning?",
          timestamp: "2024-02-19T17:10:00Z",
          status: "read"
        },
        {
          id: 25,
          sender_id: 3,
          image: {
            name: "AC_unit_issue.jpg",
            url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
            size: "1.2 MB"
          },
          text: "Here's a photo of the AC unit showing the issue",
          timestamp: "2024-02-19T17:16:00Z",
          status: "read"
        },
        {
          id: 26,
          sender_id: 1,
          text: "Perfect! I've scheduled the technician for tomorrow at 10 AM. They'll contact you 30 minutes before arrival.",
          timestamp: "2024-02-19T17:30:00Z",
          status: "read"
        },
        {
          id: 27,
          sender_id: 3,
          text: "Thank you so much for the quick response! I really appreciate it.",
          timestamp: "2024-02-19T17:35:00Z",
          status: "sent"
        }
      ]
    }
  ]
};

/**
 * Messaging Service Class
 */
class MessagingService {
  /**
   * Get conversations for a specific user role
   */
  async getConversations(userRole) {
    await mockDelay();
    
    const conversations = mockConversations[userRole] || [];
    
    return {
      success: true,
      data: conversations
    };
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId, userRole) {
    await mockDelay();
    
    const conversations = mockConversations[userRole] || [];
    const conversation = conversations.find(c => c.id === parseInt(conversationId));
    
    if (!conversation) {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    return {
      success: true,
      data: conversation
    };
  }

  /**
   * Send a new message
   */
  async sendMessage(conversationId, userRole, messageData) {
    await mockDelay();
    
    const conversations = mockConversations[userRole] || [];
    const conversation = conversations.find(c => c.id === parseInt(conversationId));
    
    if (!conversation) {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    const newMessage = {
      id: Date.now(),
      sender_id: messageData.sender_id,
      text: messageData.text,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    conversation.messages.push(newMessage);
    
    return {
      success: true,
      data: newMessage
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId, userRole, messageIds) {
    await mockDelay();
    
    const conversations = mockConversations[userRole] || [];
    const conversation = conversations.find(c => c.id === parseInt(conversationId));
    
    if (!conversation) {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    conversation.messages.forEach(message => {
      if (messageIds.includes(message.id)) {
        message.status = 'read';
      }
    });
    
    return {
      success: true,
      data: { updated: messageIds.length }
    };
  }

  /**
   * Search conversations
   */
  async searchConversations(userRole, query) {
    await mockDelay();
    
    const conversations = mockConversations[userRole] || [];
    
    const filteredConversations = conversations.filter(conversation => {
      const participantMatch = conversation.participant.name.toLowerCase().includes(query.toLowerCase());
      const messageMatch = conversation.messages.some(message => 
        message.text && message.text.toLowerCase().includes(query.toLowerCase())
      );
      
      return participantMatch || messageMatch;
    });
    
    return {
      success: true,
      data: filteredConversations
    };
  }
}

// Create and export singleton instance
export const messagingService = new MessagingService();
export default messagingService;
