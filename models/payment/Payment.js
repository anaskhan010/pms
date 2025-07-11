const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Payment {
  constructor(paymentData) {
    this.payment_id = paymentData.payment_id;
    this.invoice_id = paymentData.invoice_id;
    this.contract_id = paymentData.contract_id;
    this.tenant_id = paymentData.tenant_id;
    this.payment_date = paymentData.payment_date;
    this.payment_amount = paymentData.payment_amount;
    this.currency = paymentData.currency;
    this.payment_method = paymentData.payment_method;
    this.transaction_reference = paymentData.transaction_reference;
    this.is_advance_payment = paymentData.is_advance_payment;
    this.recorded_at = paymentData.recorded_at;
  }

  static async create(paymentData) {
    const paymentId = uuidv4();
    
    const sql = `
      INSERT INTO Payments (
        payment_id, invoice_id, contract_id, tenant_id, payment_date,
        payment_amount, currency, payment_method, transaction_reference,
        is_advance_payment, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
      paymentId,
      paymentData.invoice_id || null,
      paymentData.contract_id || null,
      paymentData.tenant_id,
      paymentData.payment_date,
      paymentData.payment_amount,
      paymentData.currency,
      paymentData.payment_method,
      paymentData.transaction_reference || null,
      paymentData.is_advance_payment || false
    ];

    await db.query(sql, values);
    
    if (paymentData.invoice_id) {
      await Payment.updateInvoiceStatus(paymentData.invoice_id);
    }
    
    return await Payment.findById(paymentId);
  }

  static async updateInvoiceStatus(invoiceId) {
    const sql = `
      SELECT 
        i.total_amount,
        COALESCE(SUM(p.payment_amount), 0) as total_paid
      FROM Invoices i
      LEFT JOIN Payments p ON i.invoice_id = p.invoice_id
      WHERE i.invoice_id = ?
      GROUP BY i.invoice_id, i.total_amount
    `;
    
    const [result] = await db.query(sql, [invoiceId]);
    if (!result) return;

    let newStatus;
    let amountDue;
    
    if (result.total_paid >= result.total_amount) {
      newStatus = 'Paid';
      amountDue = 0;
    } else if (result.total_paid > 0) {
      newStatus = 'Partially Paid';
      amountDue = result.total_amount - result.total_paid;
    } else {
      newStatus = 'Generated';
      amountDue = result.total_amount;
    }

    await db.query(
      'UPDATE Invoices SET invoice_status = ?, amount_due = ? WHERE invoice_id = ?',
      [newStatus, amountDue, invoiceId]
    );
  }

  static async findById(id) {
    const sql = 'SELECT * FROM Payments WHERE payment_id = ?';
    const [payment] = await db.query(sql, [id]);
    return payment ? new Payment(payment) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT p.*, t.first_name, t.last_name, i.invoice_number, u.unit_number, pr.property_number
      FROM Payments p
      INNER JOIN Tenants t ON p.tenant_id = t.tenant_id
      LEFT JOIN Invoices i ON p.invoice_id = i.invoice_id
      LEFT JOIN Contracts c ON p.contract_id = c.contract_id
      LEFT JOIN Units u ON COALESCE(i.unit_id, c.unit_id) = u.unit_id
      LEFT JOIN Properties pr ON u.property_id = pr.property_id
      WHERE 1=1
    `;
    let countSql = 'SELECT COUNT(*) as total FROM Payments WHERE 1=1';
    const values = [];

    if (filters.tenant_id) {
      sql += ' AND p.tenant_id = ?';
      countSql += ' AND tenant_id = ?';
      values.push(filters.tenant_id);
    }

    if (filters.payment_method) {
      sql += ' AND p.payment_method = ?';
      countSql += ' AND payment_method = ?';
      values.push(filters.payment_method);
    }

    if (filters.contract_id) {
      sql += ' AND p.contract_id = ?';
      countSql += ' AND contract_id = ?';
      values.push(filters.contract_id);
    }

    if (filters.is_advance_payment !== undefined) {
      sql += ' AND p.is_advance_payment = ?';
      countSql += ' AND is_advance_payment = ?';
      values.push(filters.is_advance_payment);
    }

    if (filters.date_from) {
      sql += ' AND p.payment_date >= ?';
      countSql += ' AND payment_date >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      sql += ' AND p.payment_date <= ?';
      countSql += ' AND payment_date <= ?';
      values.push(filters.date_to);
    }

    sql += ' ORDER BY p.recorded_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const payments = await db.query(sql, values);

    return {
      payments: payments.map(payment => new Payment(payment)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  async update(updateData) {
    const allowedFields = [
      'payment_date', 'payment_amount', 'currency', 'payment_method',
      'transaction_reference', 'is_advance_payment'
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

    values.push(this.payment_id);

    const sql = `UPDATE Payments SET ${updates.join(', ')} WHERE payment_id = ?`;
    await db.query(sql, values);

    if (this.invoice_id) {
      await Payment.updateInvoiceStatus(this.invoice_id);
    }

    return await Payment.findById(this.payment_id);
  }

  async delete() {
    const sql = 'DELETE FROM Payments WHERE payment_id = ?';
    await db.query(sql, [this.payment_id]);

    if (this.invoice_id) {
      await Payment.updateInvoiceStatus(this.invoice_id);
    }
  }

  async getDetails() {
    const sql = `
      SELECT 
        p.*,
        t.first_name, t.last_name, t.email as tenant_email,
        i.invoice_number, i.total_amount as invoice_amount, i.due_date,
        u.unit_number, pr.property_number, pr.address_line1,
        c.monthly_rent_amount, c.contract_type
      FROM Payments p
      INNER JOIN Tenants t ON p.tenant_id = t.tenant_id
      LEFT JOIN Invoices i ON p.invoice_id = i.invoice_id
      LEFT JOIN Contracts c ON p.contract_id = c.contract_id
      LEFT JOIN Units u ON COALESCE(i.unit_id, c.unit_id) = u.unit_id
      LEFT JOIN Properties pr ON u.property_id = pr.property_id
      WHERE p.payment_id = ?
    `;
    
    const [details] = await db.query(sql, [this.payment_id]);
    return details;
  }

  static async getTenantPaymentStats(tenantId, year = null) {
    const currentYear = year || new Date().getFullYear();
    
    const sql = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(payment_amount) as total_amount,
        AVG(payment_amount) as average_amount,
        MIN(payment_date) as first_payment,
        MAX(payment_date) as last_payment,
        COUNT(CASE WHEN is_advance_payment = true THEN 1 END) as advance_payments,
        SUM(CASE WHEN is_advance_payment = true THEN payment_amount ELSE 0 END) as advance_amount
      FROM Payments 
      WHERE tenant_id = ? AND YEAR(payment_date) = ?
    `;
    
    const [stats] = await db.query(sql, [tenantId, currentYear]);
    return stats;
  }

  static async getMonthlyPaymentSummary(year = null, month = null) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    
    const sql = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(payment_amount) as total_amount,
        COUNT(DISTINCT tenant_id) as unique_tenants,
        payment_method,
        COUNT(*) as method_count,
        SUM(payment_amount) as method_amount
      FROM Payments 
      WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ?
      GROUP BY payment_method
      ORDER BY method_amount DESC
    `;
    
    const summary = await db.query(sql, [currentYear, currentMonth]);
    return summary;
  }

  async processRefund(refundAmount, reason = null) {
    if (refundAmount > this.payment_amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const refundData = {
      invoice_id: this.invoice_id,
      contract_id: this.contract_id,
      tenant_id: this.tenant_id,
      payment_date: new Date().toISOString().split('T')[0],
      payment_amount: -refundAmount,
      currency: this.currency,
      payment_method: 'Refund',
      transaction_reference: `REFUND-${this.payment_id}`,
      is_advance_payment: false
    };

    return await Payment.create(refundData);
  }
}

module.exports = Payment;
