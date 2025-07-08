/**
 * Notification Service
 * Handles user notifications and feedback messages
 */

// Simple notification state management
let notifications = [];
let listeners = [];

const notificationService = {
  /**
   * Add a notification
   * @param {Object} notification - Notification object
   */
  addNotification(notification) {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: new Date()
    };
    
    notifications.push(newNotification);
    this.notifyListeners();
    
    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },

  /**
   * Remove a notification
   * @param {string|number} id - Notification ID
   */
  removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    this.notifyListeners();
  },

  /**
   * Clear all notifications
   */
  clearAll() {
    notifications = [];
    this.notifyListeners();
  },

  /**
   * Get all notifications
   * @returns {Array} Array of notifications
   */
  getNotifications() {
    return [...notifications];
  },

  /**
   * Subscribe to notification changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  /**
   * Notify all listeners
   */
  notifyListeners() {
    listeners.forEach(listener => listener(notifications));
  },

  // Convenience methods for different notification types
  
  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   */
  success(message, options = {}) {
    return this.addNotification({
      type: 'success',
      message,
      ...options
    });
  },

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  error(message, options = {}) {
    return this.addNotification({
      type: 'error',
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  },

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  warning(message, options = {}) {
    return this.addNotification({
      type: 'warning',
      message,
      ...options
    });
  },

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  info(message, options = {}) {
    return this.addNotification({
      type: 'info',
      message,
      ...options
    });
  },

  /**
   * Show loading notification
   * @param {string} message - Loading message
   * @param {Object} options - Additional options
   */
  loading(message, options = {}) {
    return this.addNotification({
      type: 'loading',
      message,
      duration: 0, // Don't auto-remove loading notifications
      ...options
    });
  }
};

export default notificationService;
