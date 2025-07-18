import db from '../config/db.js';

/**
 * Create Virtual Tours and Vendors Management Tables
 * This script creates the database tables for virtual tours and vendors with role-based access control
 */

const createVirtualToursVendorsTables = async () => {
  try {
    console.log('🏗️ CREATING VIRTUAL TOURS AND VENDORS TABLES\n');
    console.log('='.repeat(60));

    // Step 1: Create Virtual Tours table
    console.log('\n📋 Step 1: Creating virtual_tours table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS virtual_tours (
        tourId INT AUTO_INCREMENT PRIMARY KEY,
        propertyType ENUM('building', 'villa', 'apartment') NOT NULL,
        propertyId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        videoUrl VARCHAR(500),
        thumbnailImage VARCHAR(500),
        duration INT DEFAULT 0 COMMENT 'Duration in seconds',
        viewCount INT DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        createdBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES user(userId) ON DELETE SET NULL,
        INDEX idx_property_type_id (propertyType, propertyId),
        INDEX idx_created_by (createdBy),
        INDEX idx_active (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ virtual_tours table created');

    // Step 2: Create Virtual Tour Features table
    console.log('\n📋 Step 2: Creating virtual_tour_features table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS virtual_tour_features (
        featureId INT AUTO_INCREMENT PRIMARY KEY,
        tourId INT NOT NULL,
        featureName VARCHAR(100) NOT NULL,
        description TEXT,
        timestamp INT DEFAULT 0 COMMENT 'Timestamp in video where feature is shown',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourId) REFERENCES virtual_tours(tourId) ON DELETE CASCADE,
        INDEX idx_tour_id (tourId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ virtual_tour_features table created');

    // Step 3: Create Vendors table
    console.log('\n📋 Step 3: Creating vendors table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vendors (
        vendorId INT AUTO_INCREMENT PRIMARY KEY,
        vendorName VARCHAR(255) NOT NULL,
        contactPerson VARCHAR(255),
        email VARCHAR(255),
        phoneNumber VARCHAR(50),
        address TEXT,
        serviceType ENUM('maintenance', 'cleaning', 'security', 'landscaping', 'plumbing', 'electrical', 'painting', 'other') NOT NULL,
        description TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Rating out of 5.00',
        isActive BOOLEAN DEFAULT 1,
        contractStartDate DATE,
        contractEndDate DATE,
        monthlyRate DECIMAL(10,2),
        emergencyContact VARCHAR(50),
        licenseNumber VARCHAR(100),
        insuranceDetails TEXT,
        createdBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES user(userId) ON DELETE SET NULL,
        INDEX idx_service_type (serviceType),
        INDEX idx_created_by (createdBy),
        INDEX idx_active (isActive),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ vendors table created');

    // Step 4: Create Vendor Assignments table
    console.log('\n📋 Step 4: Creating vendor_assignments table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vendor_assignments (
        assignmentId INT AUTO_INCREMENT PRIMARY KEY,
        vendorId INT NOT NULL,
        propertyType ENUM('building', 'villa') NOT NULL,
        propertyId INT NOT NULL,
        assignedBy INT,
        startDate DATE NOT NULL,
        endDate DATE,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES vendors(vendorId) ON DELETE CASCADE,
        FOREIGN KEY (assignedBy) REFERENCES user(userId) ON DELETE SET NULL,
        INDEX idx_vendor_id (vendorId),
        INDEX idx_property_type_id (propertyType, propertyId),
        INDEX idx_assigned_by (assignedBy),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ vendor_assignments table created');

    // Step 5: Create Vendor Reviews table
    console.log('\n📋 Step 5: Creating vendor_reviews table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vendor_reviews (
        reviewId INT AUTO_INCREMENT PRIMARY KEY,
        vendorId INT NOT NULL,
        assignmentId INT,
        reviewerUserId INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        reviewText TEXT,
        serviceDate DATE,
        isRecommended BOOLEAN DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES vendors(vendorId) ON DELETE CASCADE,
        FOREIGN KEY (assignmentId) REFERENCES vendor_assignments(assignmentId) ON DELETE SET NULL,
        FOREIGN KEY (reviewerUserId) REFERENCES user(userId) ON DELETE CASCADE,
        INDEX idx_vendor_id (vendorId),
        INDEX idx_reviewer_id (reviewerUserId),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ vendor_reviews table created');

    // Step 6: Add permissions for virtual tours and vendors
    console.log('\n📋 Step 6: Adding permissions for virtual tours and vendors...');
    
    const permissions = [
      // Virtual Tours permissions
      { name: 'virtual_tours.view', resource: 'virtual_tours', action: 'view', description: 'View virtual tours' },
      { name: 'virtual_tours.create', resource: 'virtual_tours', action: 'create', description: 'Create virtual tours' },
      { name: 'virtual_tours.update', resource: 'virtual_tours', action: 'update', description: 'Update virtual tours' },
      { name: 'virtual_tours.delete', resource: 'virtual_tours', action: 'delete', description: 'Delete virtual tours' },
      
      // Vendors permissions (update existing if they exist)
      { name: 'vendors.view', resource: 'vendors', action: 'view', description: 'View vendors' },
      { name: 'vendors.create', resource: 'vendors', action: 'create', description: 'Create vendors' },
      { name: 'vendors.update', resource: 'vendors', action: 'update', description: 'Update vendors' },
      { name: 'vendors.delete', resource: 'vendors', action: 'delete', description: 'Delete vendors' },
      { name: 'vendors.assign', resource: 'vendors', action: 'assign', description: 'Assign vendors to properties' },
      { name: 'vendors.review', resource: 'vendors', action: 'review', description: 'Review vendors' }
    ];

    for (const permission of permissions) {
      // Check if permission already exists
      const [existing] = await db.execute(`
        SELECT COUNT(*) as count FROM permissions WHERE permissionName = ?
      `, [permission.name]);

      if (existing[0].count === 0) {
        await db.execute(`
          INSERT INTO permissions (permissionName, resource, action, description)
          VALUES (?, ?, ?, ?)
        `, [permission.name, permission.resource, permission.action, permission.description]);
        
        console.log(`  ✅ Added permission: ${permission.name}`);
      } else {
        console.log(`  ⚠️ Permission already exists: ${permission.name}`);
      }
    }

    // Step 7: Assign permissions to roles
    console.log('\n📋 Step 7: Assigning permissions to roles...');
    
    const rolePermissionAssignments = [
      // Admin gets all permissions
      { roleId: 1, permissions: permissions.map(p => p.name) },
      
      // Owner gets most permissions
      { roleId: 2, permissions: [
        'virtual_tours.view', 'virtual_tours.create', 'virtual_tours.update', 'virtual_tours.delete',
        'vendors.view', 'vendors.create', 'vendors.update', 'vendors.delete', 'vendors.assign', 'vendors.review'
      ]},
      
      // Manager gets operational permissions
      { roleId: 3, permissions: [
        'virtual_tours.view', 'virtual_tours.create', 'virtual_tours.update',
        'vendors.view', 'vendors.assign', 'vendors.review'
      ]},
      
      // Staff gets view permissions
      { roleId: 4, permissions: [
        'virtual_tours.view', 'vendors.view'
      ]},
      
      // Maintenance gets vendor-related permissions
      { roleId: 5, permissions: [
        'virtual_tours.view', 'vendors.view', 'vendors.review'
      ]},
      
      // Security gets basic view permissions
      { roleId: 6, permissions: [
        'virtual_tours.view', 'vendors.view'
      ]}
    ];

    for (const assignment of rolePermissionAssignments) {
      const [roleInfo] = await db.execute(`
        SELECT roleName FROM role WHERE roleId = ?
      `, [assignment.roleId]);

      if (roleInfo.length > 0) {
        const roleName = roleInfo[0].roleName;
        console.log(`\n🔑 Assigning permissions to ${roleName}:`);

        for (const permissionName of assignment.permissions) {
          // Get permission ID
          const [permissionInfo] = await db.execute(`
            SELECT permissionId FROM permissions WHERE permissionName = ?
          `, [permissionName]);

          if (permissionInfo.length > 0) {
            const permissionId = permissionInfo[0].permissionId;

            // Check if assignment already exists
            const [existingAssignment] = await db.execute(`
              SELECT COUNT(*) as count FROM role_permissions 
              WHERE roleId = ? AND permissionId = ?
            `, [assignment.roleId, permissionId]);

            if (existingAssignment[0].count === 0) {
              await db.execute(`
                INSERT INTO role_permissions (roleId, permissionId)
                VALUES (?, ?)
              `, [assignment.roleId, permissionId]);
              
              console.log(`  ✅ ${permissionName}`);
            } else {
              console.log(`  ⚠️ ${permissionName} (already assigned)`);
            }
          }
        }
      }
    }

    // Step 8: Insert sample data
    console.log('\n📋 Step 8: Inserting sample data...');
    
    // Sample virtual tours
    const sampleTours = [
      {
        propertyType: 'villa',
        propertyId: 8, // Existing villa ID
        title: 'Luxury Desert Oasis Villa Virtual Tour',
        description: 'Complete virtual walkthrough of our luxury desert villa featuring modern amenities and stunning views.',
        videoUrl: 'https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4',
        thumbnailImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1475&q=80',
        duration: 300,
        createdBy: 2
      }
    ];

    for (const tour of sampleTours) {
      await db.execute(`
        INSERT INTO virtual_tours (propertyType, propertyId, title, description, videoUrl, thumbnailImage, duration, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [tour.propertyType, tour.propertyId, tour.title, tour.description, tour.videoUrl, tour.thumbnailImage, tour.duration, tour.createdBy]);
      
      console.log(`  ✅ Added virtual tour: ${tour.title}`);
    }

    // Sample vendors
    const sampleVendors = [
      {
        vendorName: 'Elite Maintenance Services',
        contactPerson: 'Ahmed Al-Rashid',
        email: 'ahmed@elitemaintenance.com',
        phoneNumber: '+971501234567',
        address: 'Dubai Marina, Dubai, UAE',
        serviceType: 'maintenance',
        description: 'Professional maintenance services for residential and commercial properties',
        rating: 4.5,
        monthlyRate: 5000.00,
        emergencyContact: '+971501234568',
        licenseNumber: 'LIC-MAINT-2024-001',
        createdBy: 2
      },
      {
        vendorName: 'Crystal Clean Services',
        contactPerson: 'Sara Al-Zahra',
        email: 'sara@crystalclean.com',
        phoneNumber: '+971501234569',
        address: 'Business Bay, Dubai, UAE',
        serviceType: 'cleaning',
        description: 'Premium cleaning services for luxury properties',
        rating: 4.8,
        monthlyRate: 3000.00,
        emergencyContact: '+971501234570',
        licenseNumber: 'LIC-CLEAN-2024-002',
        createdBy: 2
      },
      {
        vendorName: 'SecureGuard Security',
        contactPerson: 'Omar Al-Mansouri',
        email: 'omar@secureguard.com',
        phoneNumber: '+971501234571',
        address: 'DIFC, Dubai, UAE',
        serviceType: 'security',
        description: '24/7 security services for residential complexes',
        rating: 4.7,
        monthlyRate: 8000.00,
        emergencyContact: '+971501234572',
        licenseNumber: 'LIC-SEC-2024-003',
        createdBy: 2
      }
    ];

    for (const vendor of sampleVendors) {
      await db.execute(`
        INSERT INTO vendors (vendorName, contactPerson, email, phoneNumber, address, serviceType, description, rating, monthlyRate, emergencyContact, licenseNumber, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [vendor.vendorName, vendor.contactPerson, vendor.email, vendor.phoneNumber, vendor.address, vendor.serviceType, vendor.description, vendor.rating, vendor.monthlyRate, vendor.emergencyContact, vendor.licenseNumber, vendor.createdBy]);
      
      console.log(`  ✅ Added vendor: ${vendor.vendorName}`);
    }

    // Step 9: Verify table creation
    console.log('\n📋 Step 9: Verifying table creation...');
    
    const tables = ['virtual_tours', 'virtual_tour_features', 'vendors', 'vendor_assignments', 'vendor_reviews'];
    
    for (const table of tables) {
      const [result] = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ✅ ${table}: ${result[0].count} records`);
    }

    console.log('\n🎯 VIRTUAL TOURS AND VENDORS TABLES CREATION COMPLETE!');
    console.log('✅ All database tables created successfully');
    console.log('✅ Permissions added and assigned to roles');
    console.log('✅ Sample data inserted');
    console.log('✅ System ready for virtual tours and vendors management');

  } catch (error) {
    console.error('💥 Error creating virtual tours and vendors tables:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
createVirtualToursVendorsTables();
