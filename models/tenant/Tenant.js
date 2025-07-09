
import db from '../../config/db.js';
import userModel from '../user/User.js';
import bcrypt from 'bcryptjs';

const createTenant = async (tenantData) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      firstName, lastName, email, password, phoneNumber, address,
      gender, nationality, dateOfBirth, image, registrationNumber,
      registrationExpiry, occupation, ejariPdfPath, apartmentId,
      contractStartDate, contractEndDate, securityFee
    } = tenantData;

    // 1. Create user account (without role assignment)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user directly without role assignment
    const userQuery = `INSERT INTO user (
      firstName, lastName, email, password, phoneNumber,
      address, gender, nationality, dateOfBirth, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const userValues = [
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      address,
      gender,
      nationality,
      dateOfBirth,
      image || ''
    ];

    console.log('Creating user for tenant...');
    const userResult = await connection.execute(userQuery, userValues);
    const userId = userResult[0].insertId;
    console.log('User created with ID:', userId);

    const user = { userId, email };

    // 2. Create tenant record
    const tenantQuery = `
      INSERT INTO tenant (
        userId, registrationNumber, registrationExpiry, occupation, ejariPdfPath
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const tenantValues = [
      user.userId,
      registrationNumber || null,
      registrationExpiry || null,
      occupation || null,
      ejariPdfPath || null
    ];

    const tenantResult = await connection.execute(tenantQuery, tenantValues);
    const tenantId = tenantResult[0].insertId;

    // 3. Assign apartment if provided
    if (apartmentId) {
      const apartmentAssignQuery = `
        INSERT INTO ApartmentAssigned (tenantId, apartmentId)
        VALUES (?, ?)
      `;
      await connection.execute(apartmentAssignQuery, [tenantId, apartmentId]);
    }

    // 4. Create contract if contract details provided
    if (contractStartDate && contractEndDate) {
      const contractQuery = `
        INSERT INTO Contract (SecurityFee, tenantId, startDate, endDate)
        VALUES (?, ?, ?, ?)
      `;

      // Use proper DATE format (YYYY-MM-DD)
      const contractValues = [
        securityFee || 0,
        tenantId,
        contractStartDate, // Now expects DATE format
        contractEndDate    // Now expects DATE format
      ];

      const contractResult = await connection.execute(contractQuery, contractValues);
      const contractId = contractResult[0].insertId;

      // 5. Create contract details if apartment is assigned
      if (apartmentId && contractId) {
        const contractDetailsQuery = `
          INSERT INTO ContractDetails (contractId, apartmentId)
          VALUES (?, ?)
        `;
        await connection.execute(contractDetailsQuery, [contractId, apartmentId]);
      }
    }

    await connection.commit();

    // Return the complete tenant data
    return await getTenantById(tenantId);

  } catch (error) {
    await connection.rollback();
    console.error('Error in createTenant:', error);
    throw error;
  } finally {
    connection.release();
  }
};


const getTenantCount = async () => {
  const query = 'SELECT COUNT(*) as total FROM tenant';
  const [result] = await db.execute(query);
  return result[0].total;
};

const getTenantById = async (tenantId) => {
  const query = `
    SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at,
           aa.apartmentId, a.bedrooms, a.bathrooms, a.rentPrice,
           f.floorName, b.buildingName, b.buildingAddress,
           c.contractId, c.SecurityFee,
           DATE_FORMAT(c.startDate, '%Y-%m-%d') as startDate,
           DATE_FORMAT(c.endDate, '%Y-%m-%d') as endDate
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN Contract c ON t.tenantId = c.tenantId
    WHERE t.tenantId = ?
  `;

  const [rows] = await db.execute(query, [tenantId]);
  return rows[0] || null;
};

const getTenantByUserId = async (userId) => {
  const query = `
    SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    WHERE t.userId = ?
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows[0] || null;
};

const getTenantByEmail = async (email) => {
  const query = `
    SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    WHERE u.email = ?
  `;

  const [rows] = await db.execute(query, [email]);
  return rows[0] || null;
};

const getAllTenants = async (page = 1, limit = 25, filters = {}) => {
  // Ensure page and limit are integers
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 25;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = `
      SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
             u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at,
             aa.apartmentId, a.bedrooms, a.bathrooms, a.rentPrice,
             f.floorName, b.buildingName, b.buildingAddress, b.buildingId
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE 1 = 1
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT t.tenantId) as total
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE 1 = 1
    `;

    const values = [];
    const countValues = [];

    // Add owner building filtering
    if (filters.ownerBuildings && filters.ownerBuildings.length > 0) {
      const placeholders = filters.ownerBuildings.map(() => '?').join(',');
      query += ` AND (b.buildingId IN (${placeholders}) OR aa.apartmentId IS NULL)`;
      countQuery += ` AND (b.buildingId IN (${placeholders}) OR aa.apartmentId IS NULL)`;
      values.push(...filters.ownerBuildings);
      countValues.push(...filters.ownerBuildings);
    }

    query += ` ORDER BY u.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    console.log('Executing getAllTenants with limit:', limitNum, 'offset:', offset);
    console.log('Query:', query);
    console.log('Values:', values);

    const [totalResult] = await db.execute(countQuery, countValues);
    const [tenants] = await db.execute(query, values);

    console.log('Query results - Total:', totalResult[0].total, 'Tenants:', tenants.length);

    return {
      tenants,
      total: totalResult[0].total,
      page: pageNum,
      pages: Math.ceil(totalResult[0].total / limitNum)
    };
  } catch (error) {
    console.error('Error in getAllTenants:', error);
    throw error;
  }
};

const updateTenant = async (tenantId, updateData) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const userFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'gender', 'nationality', 'dateOfBirth', 'image'];
  const tenantFields = ['registrationNumber', 'registrationExpiry', 'occupation'];

  const userUpdates = {};
  const tenantUpdates = {};

  for (const [key, value] of Object.entries(updateData)) {
    if (userFields.includes(key) && value !== undefined) {
      userUpdates[key] = value;
    } else if (tenantFields.includes(key) && value !== undefined) {
      tenantUpdates[key] = value;
    }
  }

  if (Object.keys(userUpdates).length > 0) {
    await userModel.updateUser(tenant.userId, userUpdates);
  }

  if (Object.keys(tenantUpdates).length > 0) {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(tenantUpdates)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }

    values.push(tenantId);
    const query = `UPDATE tenant SET ${updates.join(', ')} WHERE tenantId = ?`;
    await db.execute(query, values);
  }

  return await getTenantById(tenantId);
};

const deleteTenant = async (tenantId) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  await db.execute('DELETE FROM tenant WHERE tenantId = ?', [tenantId]);

  await userModel.deleteUser(tenant.userId);

  return true;
};

const getTenantApartments = async (tenantId) => {
  const query = `
    SELECT aa.*, a.bedrooms, a.bathrooms, a.length, a.width, a.rentPrice,
           f.floorName, b.buildingName, b.buildingAddress
    FROM ApartmentAssigned aa
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE aa.tenantId = ?
  `;

  const [rows] = await db.execute(query, [tenantId]);
  return rows;
};

const assignApartment = async (tenantId, apartmentId, contractData = null) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Check if apartment exists and is vacant
  const apartmentCheck = await db.execute(
    'SELECT apartmentId, status FROM apartment WHERE apartmentId = ?',
    [apartmentId]
  );

  if (apartmentCheck[0].length === 0) {
    throw new Error('Apartment not found');
  }

  if (apartmentCheck[0][0].status === 'Rented') {
    throw new Error('Apartment is already rented');
  }

  const existingAssignment = await db.execute(
    'SELECT * FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?',
    [tenantId, apartmentId]
  );

  if (existingAssignment[0].length > 0) {
    throw new Error('Apartment already assigned to this tenant');
  }

  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Assign apartment to tenant
    const assignQuery = 'INSERT INTO ApartmentAssigned (tenantId, apartmentId) VALUES (?, ?)';
    const assignResult = await connection.execute(assignQuery, [tenantId, apartmentId]);
    const assignmentId = assignResult[0].insertId;

    // 2. Update apartment status to 'Rented'
    const statusUpdateQuery = 'UPDATE apartment SET status = ? WHERE apartmentId = ?';
    await connection.execute(statusUpdateQuery, ['Rented', apartmentId]);

    // 3. Create contract if contract data is provided
    let contractId = null;
    if (contractData && contractData.startDate && contractData.endDate) {
      const contractQuery = `
        INSERT INTO Contract (SecurityFee, tenantId, startDate, endDate)
        VALUES (?, ?, ?, ?)
      `;
      const contractValues = [
        contractData.securityFee || 0,
        tenantId,
        contractData.startDate,
        contractData.endDate
      ];
      const contractResult = await connection.execute(contractQuery, contractValues);
      contractId = contractResult[0].insertId;

      // 4. Link contract to apartment in ContractDetails
      const contractDetailsQuery = `
        INSERT INTO ContractDetails (contractId, apartmentId)
        VALUES (?, ?)
      `;
      await connection.execute(contractDetailsQuery, [contractId, apartmentId]);
    }

    await connection.commit();

    return {
      assignmentId,
      contractId,
      tenantId,
      apartmentId,
      message: 'Apartment assigned successfully'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const removeApartmentAssignment = async (tenantId, apartmentId) => {
  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Check if assignment exists
    const checkQuery = 'SELECT * FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?';
    const checkResult = await connection.execute(checkQuery, [tenantId, apartmentId]);

    if (checkResult[0].length === 0) {
      await connection.rollback();
      return false;
    }

    // 2. Remove apartment assignment
    const deleteQuery = 'DELETE FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?';
    const deleteResult = await connection.execute(deleteQuery, [tenantId, apartmentId]);

    // 3. Update apartment status back to 'Vacant'
    const statusUpdateQuery = 'UPDATE apartment SET status = ? WHERE apartmentId = ?';
    await connection.execute(statusUpdateQuery, ['Vacant', apartmentId]);

    // 4. Optionally handle contract cleanup (you might want to keep contracts for history)
    // For now, we'll keep the contract but you could add logic to mark it as terminated

    await connection.commit();
    return deleteResult[0].affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getTenantStatistics = async () => {
  const query = `
    SELECT
      COUNT(*) as totalTenants,
      COUNT(DISTINCT t.userId) as uniqueUsers,
      COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as newThisMonth,
      COUNT(DISTINCT u.nationality) as uniqueNationalities
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
  `;

  const [rows] = await db.execute(query);
  return rows[0];
};

// Helper functions for tenant creation form
const getAllBuildings = async () => {
  const query = `
    SELECT buildingId, buildingName, buildingAddress, buildingCreatedDate
    FROM building
    ORDER BY buildingName
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getFloorsByBuilding = async (buildingId) => {
  const query = `
    SELECT floorId, floorName, buildingId
    FROM floor
    WHERE buildingId = ?
    ORDER BY floorName
  `;
  const [rows] = await db.execute(query, [buildingId]);
  return rows;
};

const getApartmentsByFloor = async (floorId) => {
  const query = `
    SELECT a.apartmentId, a.bedrooms, a.bathrooms, a.length, a.width, a.rentPrice,a.status,a.description,
           f.floorName, b.buildingName
          
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    WHERE a.floorId = ?
    ORDER BY a.apartmentId
  `;
  const [rows] = await db.execute(query, [floorId]);
  return rows;
};

const getAvailableApartments = async () => {
  const query = `
    SELECT a.apartmentId, a.bedrooms, a.bathrooms, a.length, a.width, a.rentPrice,
           f.floorName, b.buildingName, b.buildingId, f.floorId
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    WHERE aa.tenantId IS NULL
    ORDER BY b.buildingName, f.floorName, a.apartmentId
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getAvailableTenantsForAssignment = async () => {
  const query = `
    SELECT t.tenantId, u.firstName, u.lastName, u.email, u.phoneNumber,
           t.occupation, u.nationality
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    WHERE aa.tenantId IS NULL
    ORDER BY u.firstName, u.lastName
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getTenantContracts = async (tenantId) => {
  const query = `
    SELECT
      c.contractId as contract_id,
      c.SecurityFee as security_fee,
      c.tenantId as tenant_id,
      DATE_FORMAT(c.startDate, '%Y-%m-%d') as start_date,
      DATE_FORMAT(c.endDate, '%Y-%m-%d') as end_date,
      c.createdAt as created_at,
      'Active' as contract_status,
      'Residential' as contract_type,
      a.rentPrice as monthly_rent_amount,
      'AED' as currency,
      CONCAT(b.buildingName, ' - ', f.floorName, ' - Apt ', a.apartmentId) as property_info,
      b.buildingAddress as property_address,
      a.bedrooms,
      a.bathrooms
    FROM Contract c
    INNER JOIN ContractDetails cd ON c.contractId = cd.contractId
    INNER JOIN apartment a ON cd.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE c.tenantId = ?
    ORDER BY c.createdAt DESC
  `;

  const [contracts] = await db.execute(query, [tenantId]);
  return contracts;
};

export default {
  createTenant,
  getTenantById,
  getTenantByUserId,
  getTenantByEmail,
  getAllTenants,
  updateTenant,
  deleteTenant,
  getTenantApartments,
  assignApartment,
  removeApartmentAssignment,
  getTenantCount,
  getTenantStatistics,
  getAllBuildings,
  getFloorsByBuilding,
  getApartmentsByFloor,
  getAvailableApartments,
  getAvailableTenantsForAssignment,
  getTenantContracts
};
