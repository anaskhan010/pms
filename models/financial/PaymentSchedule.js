import db from '../../config/db.js';

/**
 * PaymentSchedule Model
 * Handles automatic payment schedule generation and management
 */

const createPaymentSchedule = async (scheduleData) => {
  const {
    contractId,
    tenantId,
    apartmentId,
    paymentType,
    amount,
    dueDate,
    status = 'Pending'
  } = scheduleData;

  const query = `
    INSERT INTO PaymentSchedule (
      contractId, tenantId, apartmentId, paymentType, amount, dueDate, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [contractId, tenantId, apartmentId, paymentType, amount, dueDate, status];

  try {
    const [result] = await db.execute(query, values);
    return await getScheduleById(result.insertId);
  } catch (error) {
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      console.error('Lock timeout in createPaymentSchedule, retrying...');
      // Wait a bit and retry once
      await new Promise(resolve => setTimeout(resolve, 100));
      const [result] = await db.execute(query, values);
      return await getScheduleById(result.insertId);
    }
    throw error;
  }
};

const getScheduleById = async (scheduleId) => {
  const query = `
    SELECT 
      ps.*,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName, b.buildingAddress,
      c.SecurityFee,
      DATE_FORMAT(c.startDate, '%Y-%m-%d') as contractStartDate,
      DATE_FORMAT(c.endDate, '%Y-%m-%d') as contractEndDate
    FROM PaymentSchedule ps
    LEFT JOIN tenant t ON ps.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN apartment a ON ps.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN Contract c ON ps.contractId = c.contractId
    WHERE ps.scheduleId = ?
  `;

  const [rows] = await db.execute(query, [scheduleId]);
  return rows[0] || null;
};

const getSchedulesByContract = async (contractId) => {
  const query = `
    SELECT 
      ps.*,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName
    FROM PaymentSchedule ps
    LEFT JOIN tenant t ON ps.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN apartment a ON ps.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    WHERE ps.contractId = ?
    ORDER BY ps.dueDate ASC
  `;

  const [rows] = await db.execute(query, [contractId]);
  return rows;
};

const getSchedulesByTenant = async (tenantId) => {
  const query = `
    SELECT 
      ps.*,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName, b.buildingAddress,
      c.SecurityFee,
      DATE_FORMAT(c.startDate, '%Y-%m-%d') as contractStartDate,
      DATE_FORMAT(c.endDate, '%Y-%m-%d') as contractEndDate
    FROM PaymentSchedule ps
    LEFT JOIN apartment a ON ps.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN Contract c ON ps.contractId = c.contractId
    WHERE ps.tenantId = ?
    ORDER BY ps.dueDate ASC
  `;

  const [rows] = await db.execute(query, [tenantId]);
  return rows;
};

const getOverduePayments = async () => {
  try {
    const query = `
      SELECT
        ps.*,
        CONCAT(u.firstName, ' ', u.lastName) as tenantName,
        u.email as tenantEmail,
        u.phoneNumber as tenantPhone,
        a.bedrooms, a.bathrooms, a.rentPrice,
        f.floorName,
        b.buildingName, b.buildingAddress,
        DATEDIFF(CURDATE(), ps.dueDate) as daysOverdue
      FROM PaymentSchedule ps
      LEFT JOIN tenant t ON ps.tenantId = t.tenantId
      LEFT JOIN user u ON t.userId = u.userId
      LEFT JOIN apartment a ON ps.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE ps.status = 'Pending' AND ps.dueDate < CURDATE()
      ORDER BY ps.dueDate ASC
    `;

    const [rows] = await db.execute(query);
    return rows || [];
  } catch (error) {
    console.error('Error in getOverduePayments:', error);
    return [];
  }
};

const updateScheduleStatus = async (scheduleId, status, transactionId = null) => {
  const query = `
    UPDATE PaymentSchedule 
    SET status = ?, transactionId = ?
    WHERE scheduleId = ?
  `;

  const [result] = await db.execute(query, [status, transactionId, scheduleId]);
  return result.affectedRows > 0;
};

const generateMonthlyRentSchedule = async (contractData) => {
  const {
    contractId,
    tenantId,
    apartmentId,
    startDate,
    endDate,
    rentAmount
  } = contractData;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Generate all schedule data first
  const scheduleValues = [];
  let currentDate = new Date(start);
  currentDate.setDate(1); // Set to first day of month

  while (currentDate <= end) {
    const dueDate = new Date(currentDate);
    dueDate.setDate(5); // Due on 5th of each month

    if (dueDate <= end) {
      scheduleValues.push([
        contractId,
        tenantId,
        apartmentId,
        'Monthly Rent',
        rentAmount,
        dueDate.toISOString().split('T')[0],
        'Pending'
      ]);
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Batch insert all schedules at once to reduce lock contention
  if (scheduleValues.length > 0) {
    const placeholders = scheduleValues.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const query = `
      INSERT INTO PaymentSchedule (
        contractId, tenantId, apartmentId, paymentType, amount, dueDate, status
      ) VALUES ${placeholders}
    `;

    const flatValues = scheduleValues.flat();

    try {
      await db.execute(query, flatValues);
      console.log(`Generated ${scheduleValues.length} monthly payment schedules`);
    } catch (error) {
      if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
        console.error('Lock timeout in generateMonthlyRentSchedule, retrying...');
        // Wait a bit and retry once
        await new Promise(resolve => setTimeout(resolve, 200));
        await db.execute(query, flatValues);
      } else {
        throw error;
      }
    }
  }

  // Return the created schedules
  return await getSchedulesByContract(contractId);
};

const generateSecurityDepositSchedule = async (contractData) => {
  const {
    contractId,
    tenantId,
    apartmentId,
    startDate,
    securityFee
  } = contractData;

  if (!securityFee || securityFee <= 0) {
    return null;
  }

  const query = `
    INSERT INTO PaymentSchedule (
      contractId, tenantId, apartmentId, paymentType, amount, dueDate, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [contractId, tenantId, apartmentId, 'Security Deposit', securityFee, startDate, 'Pending'];

  try {
    const [result] = await db.execute(query, values);
    return await getScheduleById(result.insertId);
  } catch (error) {
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      console.error('Lock timeout in generateSecurityDepositSchedule, retrying...');
      // Wait a bit and retry once
      await new Promise(resolve => setTimeout(resolve, 100));
      const [result] = await db.execute(query, values);
      return await getScheduleById(result.insertId);
    }
    throw error;
  }
};

const deleteSchedulesByContract = async (contractId) => {
  const query = 'DELETE FROM PaymentSchedule WHERE contractId = ?';
  const [result] = await db.execute(query, [contractId]);
  return result.affectedRows;
};

const getUpcomingPayments = async (days = 7) => {
  try {
    const query = `
      SELECT
        ps.*,
        CONCAT(u.firstName, ' ', u.lastName) as tenantName,
        u.email as tenantEmail,
        u.phoneNumber as tenantPhone,
        a.bedrooms, a.bathrooms, a.rentPrice,
        f.floorName,
        b.buildingName, b.buildingAddress,
        DATEDIFF(ps.dueDate, CURDATE()) as daysUntilDue
      FROM PaymentSchedule ps
      LEFT JOIN tenant t ON ps.tenantId = t.tenantId
      LEFT JOIN user u ON t.userId = u.userId
      LEFT JOIN apartment a ON ps.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE ps.status = 'Pending'
        AND ps.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY ps.dueDate ASC
    `;

    const [rows] = await db.execute(query, [days]);
    return rows || [];
  } catch (error) {
    console.error('Error in getUpcomingPayments:', error);
    return [];
  }
};

const getPaymentStatistics = async (filters = {}) => {
  try {
    let query = `
      SELECT
        COUNT(*) as totalScheduled,
        SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) as totalPaid,
        SUM(CASE WHEN status = 'Pending' AND dueDate < CURDATE() THEN 1 ELSE 0 END) as totalOverdue,
        SUM(CASE WHEN status = 'Pending' AND dueDate >= CURDATE() THEN 1 ELSE 0 END) as totalUpcoming,
        SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) as totalAmountPaid,
        SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) as totalAmountPending
      FROM PaymentSchedule ps
      WHERE 1 = 1
    `;

    const queryParams = [];

    if (filters.tenantId) {
      query += ' AND ps.tenantId = ?';
      queryParams.push(filters.tenantId);
    }

    if (filters.contractId) {
      query += ' AND ps.contractId = ?';
      queryParams.push(filters.contractId);
    }

    if (filters.apartmentId) {
      query += ' AND ps.apartmentId = ?';
      queryParams.push(filters.apartmentId);
    }

    const [rows] = await db.execute(query, queryParams);
    return rows[0] || {};
  } catch (error) {
    console.error('Error in getPaymentStatistics:', error);
    return {};
  }
};

export default {
  createPaymentSchedule,
  getScheduleById,
  getSchedulesByContract,
  getSchedulesByTenant,
  getOverduePayments,
  updateScheduleStatus,
  generateMonthlyRentSchedule,
  generateSecurityDepositSchedule,
  deleteSchedulesByContract,
  getUpcomingPayments,
  getPaymentStatistics
};
