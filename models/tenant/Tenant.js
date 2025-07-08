
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
    // Simple query without complex filtering for now
    const query = `
      SELECT t.*, u.firstName, u.lastName, u.email, u.phoneNumber,
             u.address, u.gender, u.nationality, u.dateOfBirth, u.image, u.created_at
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      ORDER BY u.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
    `;

    console.log('Executing getAllTenants with limit:', limitNum, 'offset:', offset);
    console.log('Query:', query);

    const [totalResult] = await db.execute(countQuery);
    const [tenants] = await db.execute(query);

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

const assignApartment = async (tenantId, apartmentId) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const existingAssignment = await db.execute(
    'SELECT * FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?',
    [tenantId, apartmentId]
  );

  if (existingAssignment[0].length > 0) {
    throw new Error('Apartment already assigned to this tenant');
  }

  const query = 'INSERT INTO ApartmentAssigned (tenantId, apartmentId) VALUES (?, ?)';
  const result = await db.execute(query, [tenantId, apartmentId]);

  return result[0].insertId;
};

const removeApartmentAssignment = async (tenantId, apartmentId) => {
  const query = 'DELETE FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?';
  const result = await db.execute(query, [tenantId, apartmentId]);

  return result[0].affectedRows > 0;
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
  getAvailableApartments
};
