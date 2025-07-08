const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Ticket {
  constructor(ticketData) {
    this.ticket_id = ticketData.ticket_id;
    this.unit_id = ticketData.unit_id;
    this.tenant_id = ticketData.tenant_id;
    this.reporter_type = ticketData.reporter_type;
    this.category = ticketData.category;
    this.subject = ticketData.subject;
    this.description = ticketData.description;
    this.priority = ticketData.priority;
    this.status = ticketData.status;
    this.assigned_to_user_id = ticketData.assigned_to_user_id;
    this.opened_at = ticketData.opened_at;
    this.last_updated_at = ticketData.last_updated_at;
    this.resolved_at = ticketData.resolved_at;
    this.closed_at = ticketData.closed_at;
  }

  static async create(ticketData) {
    const ticketId = uuidv4();
    
    const sql = `
      INSERT INTO Tickets (
        ticket_id, unit_id, tenant_id, reporter_type, category, subject,
        description, priority, status, assigned_to_user_id, opened_at, last_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      ticketId,
      ticketData.unit_id,
      ticketData.tenant_id || null,
      ticketData.reporter_type,
      ticketData.category,
      ticketData.subject,
      ticketData.description || null,
      ticketData.priority || 'Medium',
      ticketData.status || 'Open',
      ticketData.assigned_to_user_id || null
    ];

    await db.query(sql, values);
    return await Ticket.findById(ticketId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM Tickets WHERE ticket_id = ?';
    const [ticket] = await db.query(sql, [id]);
    return ticket ? new Ticket(ticket) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT t.*, u.unit_number, p.property_number, p.address_line1,
             tn.first_name, tn.last_name, usr.username as assigned_to
      FROM Tickets t
      INNER JOIN Units u ON t.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      LEFT JOIN Tenants tn ON t.tenant_id = tn.tenant_id
      LEFT JOIN Users usr ON t.assigned_to_user_id = usr.user_id
      WHERE 1=1
    `;
    let countSql = 'SELECT COUNT(*) as total FROM Tickets WHERE 1=1';
    const values = [];

    if (filters.status) {
      sql += ' AND t.status = ?';
      countSql += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.priority) {
      sql += ' AND t.priority = ?';
      countSql += ' AND priority = ?';
      values.push(filters.priority);
    }

    if (filters.category) {
      sql += ' AND t.category = ?';
      countSql += ' AND category = ?';
      values.push(filters.category);
    }

    if (filters.unit_id) {
      sql += ' AND t.unit_id = ?';
      countSql += ' AND unit_id = ?';
      values.push(filters.unit_id);
    }

    if (filters.tenant_id) {
      sql += ' AND t.tenant_id = ?';
      countSql += ' AND tenant_id = ?';
      values.push(filters.tenant_id);
    }

    if (filters.assigned_to_user_id) {
      sql += ' AND t.assigned_to_user_id = ?';
      countSql += ' AND assigned_to_user_id = ?';
      values.push(filters.assigned_to_user_id);
    }

    if (filters.reporter_type) {
      sql += ' AND t.reporter_type = ?';
      countSql += ' AND reporter_type = ?';
      values.push(filters.reporter_type);
    }

    sql += ' ORDER BY t.opened_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const tickets = await db.query(sql, values);

    return {
      tickets: tickets.map(ticket => new Ticket(ticket)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  async update(updateData) {
    const allowedFields = [
      'category', 'subject', 'description', 'priority', 'status',
      'assigned_to_user_id', 'resolved_at', 'closed_at'
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('last_updated_at = NOW()');
    values.push(this.ticket_id);

    const sql = `UPDATE Tickets SET ${updates.join(', ')} WHERE ticket_id = ?`;
    await db.query(sql, values);

    return await Ticket.findById(this.ticket_id);
  }

  async delete() {
    const sql = 'DELETE FROM Tickets WHERE ticket_id = ?';
    await db.query(sql, [this.ticket_id]);
  }

  async getDetails() {
    const sql = `
      SELECT 
        t.*,
        u.unit_number, u.unit_type,
        p.property_number, p.address_line1, p.city,
        tn.first_name, tn.last_name, tn.email as tenant_email, tn.phone_number as tenant_phone,
        usr.username as assigned_to, usr.email as assigned_email
      FROM Tickets t
      INNER JOIN Units u ON t.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      LEFT JOIN Tenants tn ON t.tenant_id = tn.tenant_id
      LEFT JOIN Users usr ON t.assigned_to_user_id = usr.user_id
      WHERE t.ticket_id = ?
    `;
    
    const [details] = await db.query(sql, [this.ticket_id]);
    return details;
  }

  async getComments() {
    const sql = `
      SELECT tc.*, u.username, u.first_name, u.last_name
      FROM TicketComments tc
      INNER JOIN Users u ON tc.user_id = u.user_id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `;
    const comments = await db.query(sql, [this.ticket_id]);
    return comments;
  }

  async addComment(userId, commentText) {
    const commentId = uuidv4();
    
    const sql = `
      INSERT INTO TicketComments (comment_id, ticket_id, user_id, comment_text, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    await db.query(sql, [commentId, this.ticket_id, userId, commentText]);
    
    await this.update({});
    
    return commentId;
  }

  async assignTo(userId) {
    return await this.update({
      assigned_to_user_id: userId,
      status: this.status === 'Open' ? 'Assigned' : this.status
    });
  }

  async changeStatus(newStatus) {
    const updateData = { status: newStatus };
    
    if (newStatus === 'Resolved') {
      updateData.resolved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    } else if (newStatus === 'Closed') {
      updateData.closed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      if (!this.resolved_at) {
        updateData.resolved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    return await this.update(updateData);
  }

  static async getStatistics(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'Assigned' THEN 1 END) as assigned_tickets,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved_tickets,
        COUNT(CASE WHEN status = 'Closed' THEN 1 END) as closed_tickets,
        COUNT(CASE WHEN priority = 'Urgent' THEN 1 END) as urgent_tickets,
        COUNT(CASE WHEN priority = 'High' THEN 1 END) as high_priority_tickets,
        AVG(CASE WHEN resolved_at IS NOT NULL THEN 
          TIMESTAMPDIFF(HOUR, opened_at, resolved_at) END) as avg_resolution_hours
      FROM Tickets
      WHERE 1=1
    `;
    const values = [];

    if (filters.unit_id) {
      sql += ' AND unit_id = ?';
      values.push(filters.unit_id);
    }

    if (filters.date_from) {
      sql += ' AND opened_at >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      sql += ' AND opened_at <= ?';
      values.push(filters.date_to);
    }

    const [stats] = await db.query(sql, values);
    return stats;
  }

  static async getTicketsByCategory(filters = {}) {
    let sql = `
      SELECT 
        category,
        COUNT(*) as ticket_count,
        COUNT(CASE WHEN status IN ('Open', 'Assigned', 'In Progress') THEN 1 END) as open_count,
        COUNT(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 END) as closed_count
      FROM Tickets
      WHERE 1=1
    `;
    const values = [];

    if (filters.date_from) {
      sql += ' AND opened_at >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      sql += ' AND opened_at <= ?';
      values.push(filters.date_to);
    }

    sql += ' GROUP BY category ORDER BY ticket_count DESC';

    const categoryStats = await db.query(sql, values);
    return categoryStats;
  }

  static async getOverdueTickets(days = 7) {
    const sql = `
      SELECT t.*, u.unit_number, p.property_number, tn.first_name, tn.last_name
      FROM Tickets t
      INNER JOIN Units u ON t.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      LEFT JOIN Tenants tn ON t.tenant_id = tn.tenant_id
      WHERE t.status IN ('Open', 'Assigned', 'In Progress')
        AND DATEDIFF(NOW(), t.opened_at) > ?
      ORDER BY t.opened_at ASC
    `;
    
    const overdueTickets = await db.query(sql, [days]);
    return overdueTickets;
  }

  isOverdue(days = 7) {
    if (['Resolved', 'Closed'].includes(this.status)) return false;
    const openedDate = new Date(this.opened_at);
    const daysDiff = (new Date() - openedDate) / (1000 * 60 * 60 * 24);
    return daysDiff > days;
  }

  getResolutionTime() {
    if (!this.resolved_at) return null;
    const openedDate = new Date(this.opened_at);
    const resolvedDate = new Date(this.resolved_at);
    return (resolvedDate - openedDate) / (1000 * 60 * 60);
  }
}

module.exports = Ticket;
