
const db = require('../../config/db');

// Create a new tenant
const create = async (tenantData) => {
  
 

  const sql = `
    INSERT INTO Tenants (
      first_name, last_name, email, phone_number, nationality,
      id_document_type, id_document_number, date_of_birth, emergency_contact_name,
      emergency_contact_phone, notes,property_id ,user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  const values = [
    
    tenantData.first_name,
    tenantData.last_name,
    tenantData.email,
    tenantData.phone_number || null,
    tenantData.nationality || null,
    tenantData.id_document_type,
    tenantData.id_document_number,
    tenantData.date_of_birth || null,
    tenantData.emergency_contact_name || null,
    tenantData.emergency_contact_phone || null,
    tenantData.notes || null,
    tenantData.property_id,
    tenantData.user_id
  ];

  const result = await db.query(sql, values);
  const tenantId = result[0].insertId;
  const tenant = await findById(tenantId);

  // Attach methods to tenant object
  if (tenant) {
    tenant.update = (updateData) => update(tenant.tenant_id, updateData);
    tenant.delete = () => deleteTenant(tenant.tenant_id);
    tenant.getContracts = () => getContracts(tenant.tenant_id);
    tenant.getActiveContracts = () => getActiveContracts(tenant.tenant_id);
    tenant.getPayments = (limit) => getPayments(tenant.tenant_id, limit);
    tenant.getTickets = (limit) => getTickets(tenant.tenant_id, limit);
    tenant.fullName = `${tenant.first_name} ${tenant.last_name}`.trim();
  }

  return tenant;
};

// Find tenant by ID
const findById = async (id) => {
  const sql = 'SELECT * FROM Tenants WHERE tenant_id = ?';
  const [rows] = await db.query(sql, [id]);

  if (rows.length > 0) {
    const tenant = rows[0];
    // Attach methods to tenant object
    tenant.update = (updateData) => update(tenant.tenant_id, updateData);
    tenant.delete = () => deleteTenant(tenant.tenant_id);
    tenant.getContracts = () => getContracts(tenant.tenant_id);
    tenant.getActiveContracts = () => getActiveContracts(tenant.tenant_id);
    tenant.getPayments = (limit) => getPayments(tenant.tenant_id, limit);
    tenant.getTickets = (limit) => getTickets(tenant.tenant_id, limit);
    tenant.fullName = `${tenant.first_name} ${tenant.last_name}`.trim();
    return tenant;
  }
  return null;
};

// Find tenant by email
const findByEmail = async (email) => {
  const sql = 'SELECT * FROM Tenants WHERE email = ?';
  const [rows] = await db.query(sql, [email]);

  if (rows.length > 0) {
    const tenant = rows[0];
    // Attach methods to tenant object
    tenant.update = (updateData) => update(tenant.tenant_id, updateData);
    tenant.delete = () => deleteTenant(tenant.tenant_id);
    tenant.getContracts = () => getContracts(tenant.tenant_id);
    tenant.getActiveContracts = () => getActiveContracts(tenant.tenant_id);
    tenant.getPayments = (limit) => getPayments(tenant.tenant_id, limit);
    tenant.getTickets = (limit) => getTickets(tenant.tenant_id, limit);
    tenant.fullName = `${tenant.first_name} ${tenant.last_name}`.trim();
    return tenant;
  }
  return null;
};

// Get all tenants with pagination
const findAll = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  let sql = 'SELECT * FROM Tenants WHERE 1=1';
  let countSql = 'SELECT COUNT(*) as total FROM Tenants WHERE 1=1';
  const values = [];

  // Apply filters
  if (filters.nationality) {
    sql += ' AND nationality = ?';
    countSql += ' AND nationality = ?';
    values.push(filters.nationality);
  }

  if (filters.search) {
    sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
    countSql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [totalResult] = await db.query(countSql, values.slice(0, -2));
  const tenants = await db.query(sql, values);

  return {
    tenants: tenants.map(tenant => {
      // Attach methods to each tenant object
      tenant.update = (updateData) => update(tenant.tenant_id, updateData);
      tenant.delete = () => deleteTenant(tenant.tenant_id);
      tenant.getContracts = () => getContracts(tenant.tenant_id);
      tenant.getActiveContracts = () => getActiveContracts(tenant.tenant_id);
      tenant.getPayments = (limit) => getPayments(tenant.tenant_id, limit);
      tenant.getTickets = (limit) => getTickets(tenant.tenant_id, limit);
      tenant.fullName = `${tenant.first_name} ${tenant.last_name}`.trim();
      return tenant;
    }),
    total: totalResult.total,
    page,
    pages: Math.ceil(totalResult.total / limit)
  };
};

// Update tenant
const update = async (tenantId, updateData) => {
  const allowedFields = [
    'first_name', 'last_name', 'email', 'phone_number', 'nationality',
    'id_document_type', 'id_document_number', 'date_of_birth',
    'emergency_contact_name', 'emergency_contact_phone', 'notes'
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

  updates.push('updated_at = NOW()');
  values.push(tenantId);

  const sql = `UPDATE Tenants SET ${updates.join(', ')} WHERE tenant_id = ?`;
  await db.query(sql, values);

  return await findById(tenantId);
};

// Delete tenant
const deleteTenant = async (tenantId) => {
  const sql = 'DELETE FROM Tenants WHERE tenant_id = ?';
  await db.query(sql, [tenantId]);
};

// Get tenant's contracts
const getContracts = async (tenantId) => {
  const sql = `
    SELECT c.*, u.unit_number, p.property_number, p.address_line1
    FROM Contracts c
    INNER JOIN Units u ON c.unit_id = u.unit_id
    INNER JOIN Properties p ON u.property_id = p.property_id
    WHERE c.tenant_id = ?
    ORDER BY c.created_at DESC
  `;
  const contracts = await db.query(sql, [tenantId]);
  return contracts;
};

// Get active contracts
const getActiveContracts = async (tenantId) => {
  const sql = `
    SELECT c.*, u.unit_number, p.property_number, p.address_line1
    FROM Contracts c
    INNER JOIN Units u ON c.unit_id = u.unit_id
    INNER JOIN Properties p ON u.property_id = p.property_id
    WHERE c.tenant_id = ? AND c.contract_status = 'Active'
    ORDER BY c.created_at DESC
  `;
  const contracts = await db.query(sql, [tenantId]);
  return contracts;
};

// Get tenant's payments
const getPayments = async (tenantId, limit = 10) => {
  const sql = `
    SELECT p.*, i.invoice_number, c.unit_id, u.unit_number
    FROM Payments p
    LEFT JOIN Invoices i ON p.invoice_id = i.invoice_id
    LEFT JOIN Contracts c ON p.contract_id = c.contract_id
    LEFT JOIN Units u ON c.unit_id = u.unit_id
    WHERE p.tenant_id = ?
    ORDER BY p.recorded_at DESC
    LIMIT ?
  `;
  const payments = await db.query(sql, [tenantId, limit]);
  return payments;
};

// Get tenant's tickets
const getTickets = async (tenantId, limit = 10) => {
  const sql = `
    SELECT t.*, u.unit_number, p.property_number
    FROM Tickets t
    INNER JOIN Units u ON t.unit_id = u.unit_id
    INNER JOIN Properties p ON u.property_id = p.property_id
    WHERE t.tenant_id = ?
    ORDER BY t.opened_at DESC
    LIMIT ?
  `;
  const tickets = await db.query(sql, [tenantId, limit]);
  return tickets;
};

module.exports = {
  create,
  findById,
  findByEmail,
  findAll,
  update,
  deleteTenant,
  getContracts,
  getActiveContracts,
  getPayments,
  getTickets
};
