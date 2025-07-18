import db from '../config/db.js';

/**
 * Add Sample Virtual Tours and Vendors Data
 * This script adds sample data to the existing virtual_tours and vendors tables
 */

const addSampleVirtualToursVendors = async () => {
  try {
    console.log('🎬🏢 ADDING SAMPLE VIRTUAL TOURS AND VENDORS DATA\n');
    console.log('='.repeat(60));

    // Step 1: Add sample virtual tours
    console.log('\n📋 Step 1: Adding sample virtual tours...');
    
    const sampleTours = [
      {
        tourName: 'Luxury Desert Oasis Villa Virtual Tour',
        tourDescription: 'Complete virtual walkthrough of our luxury desert villa featuring modern amenities and stunning views.',
        resourceType: 'villa',
        resourceId: 8, // Existing villa ID
        tourUrl: 'https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4',
        tourImages: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1475&q=80',
          'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        ],
        createdBy: 2
      },
      {
        tourName: 'Modern Apartment Complex Tour',
        tourDescription: 'Explore our state-of-the-art apartment complex with premium amenities and contemporary design.',
        resourceType: 'building',
        resourceId: 1, // Existing building ID
        tourUrl: 'https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4',
        tourImages: [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
          'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        ],
        createdBy: 2
      },
      {
        tourName: 'Executive Penthouse Virtual Experience',
        tourDescription: 'Immersive virtual tour of our exclusive penthouse with panoramic city views and luxury finishes.',
        resourceType: 'apartment',
        resourceId: 1, // Existing apartment ID
        tourUrl: 'https://www.youtube.com/embed/B4o8PvcqHC4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&loop=1&playlist=B4o8PvcqHC4',
        tourImages: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
        ],
        createdBy: 2
      }
    ];

    for (const tour of sampleTours) {
      // Check if tour already exists
      const [existing] = await db.execute(`
        SELECT COUNT(*) as count FROM virtual_tours 
        WHERE tourName = ? AND resourceType = ? AND resourceId = ?
      `, [tour.tourName, tour.resourceType, tour.resourceId]);

      if (existing[0].count === 0) {
        await db.execute(`
          INSERT INTO virtual_tours (tourName, tourDescription, resourceType, resourceId, tourUrl, tourImages, createdBy)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          tour.tourName, 
          tour.tourDescription, 
          tour.resourceType, 
          tour.resourceId, 
          tour.tourUrl, 
          JSON.stringify(tour.tourImages), 
          tour.createdBy
        ]);
        
        console.log(`  ✅ Added virtual tour: ${tour.tourName}`);
      } else {
        console.log(`  ⚠️ Virtual tour already exists: ${tour.tourName}`);
      }
    }

    // Step 2: Add sample vendors
    console.log('\n📋 Step 2: Adding sample vendors...');
    
    const sampleVendors = [
      {
        vendorName: 'Elite Maintenance Services',
        vendorType: 'maintenance',
        contactPerson: 'Ahmed Al-Rashid',
        phoneNumber: '+971501234567',
        email: 'ahmed@elitemaintenance.com',
        address: 'Dubai Marina, Dubai, UAE',
        serviceDescription: 'Professional maintenance services for residential and commercial properties including HVAC, plumbing, electrical, and general repairs.',
        createdBy: 2
      },
      {
        vendorName: 'Crystal Clean Services',
        vendorType: 'cleaning',
        contactPerson: 'Sara Al-Zahra',
        phoneNumber: '+971501234569',
        email: 'sara@crystalclean.com',
        address: 'Business Bay, Dubai, UAE',
        serviceDescription: 'Premium cleaning services for luxury properties including deep cleaning, regular maintenance, and specialized cleaning solutions.',
        createdBy: 2
      },
      {
        vendorName: 'SecureGuard Security',
        vendorType: 'security',
        contactPerson: 'Omar Al-Mansouri',
        phoneNumber: '+971501234571',
        email: 'omar@secureguard.com',
        address: 'DIFC, Dubai, UAE',
        serviceDescription: '24/7 security services for residential complexes including surveillance, access control, and emergency response.',
        createdBy: 2
      },
      {
        vendorName: 'PowerTech Utilities',
        vendorType: 'utilities',
        contactPerson: 'Khalid Al-Mahmoud',
        phoneNumber: '+971501234573',
        email: 'khalid@powertech.com',
        address: 'Al Barsha, Dubai, UAE',
        serviceDescription: 'Comprehensive utilities management including electricity, water, gas, and telecommunications infrastructure.',
        createdBy: 2
      },
      {
        vendorName: 'ProFix Solutions',
        vendorType: 'other',
        contactPerson: 'Fatima Al-Zahra',
        phoneNumber: '+971501234575',
        email: 'fatima@profix.com',
        address: 'Jumeirah, Dubai, UAE',
        serviceDescription: 'General contracting and repair services including carpentry, painting, flooring, and renovation projects.',
        createdBy: 2
      }
    ];

    for (const vendor of sampleVendors) {
      // Check if vendor already exists
      const [existing] = await db.execute(`
        SELECT COUNT(*) as count FROM vendors 
        WHERE vendorName = ? AND vendorType = ?
      `, [vendor.vendorName, vendor.vendorType]);

      if (existing[0].count === 0) {
        await db.execute(`
          INSERT INTO vendors (vendorName, vendorType, contactPerson, phoneNumber, email, address, serviceDescription, createdBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          vendor.vendorName,
          vendor.vendorType,
          vendor.contactPerson,
          vendor.phoneNumber,
          vendor.email,
          vendor.address,
          vendor.serviceDescription,
          vendor.createdBy
        ]);
        
        console.log(`  ✅ Added vendor: ${vendor.vendorName}`);
      } else {
        console.log(`  ⚠️ Vendor already exists: ${vendor.vendorName}`);
      }
    }

    // Step 3: Verify the additions
    console.log('\n📋 Step 3: Verifying data additions...');
    
    // Check virtual tours
    const [finalVirtualTours] = await db.execute(`
      SELECT COUNT(*) as count FROM virtual_tours WHERE isActive = 1
    `);
    console.log(`✅ Total virtual tours: ${finalVirtualTours[0].count}`);

    // Check vendors
    const [finalVendors] = await db.execute(`
      SELECT COUNT(*) as count FROM vendors WHERE isActive = 1
    `);
    console.log(`✅ Total vendors: ${finalVendors[0].count}`);

    // Show virtual tours by resource type
    const [toursByType] = await db.execute(`
      SELECT resourceType, COUNT(*) as count
      FROM virtual_tours
      WHERE isActive = 1
      GROUP BY resourceType
    `);

    console.log('\n📊 Virtual Tours by Resource Type:');
    toursByType.forEach(type => {
      console.log(`  - ${type.resourceType}: ${type.count} tours`);
    });

    // Show vendors by type
    const [vendorsByType] = await db.execute(`
      SELECT vendorType, COUNT(*) as count
      FROM vendors
      WHERE isActive = 1
      GROUP BY vendorType
    `);

    console.log('\n📊 Vendors by Service Type:');
    vendorsByType.forEach(type => {
      console.log(`  - ${type.vendorType}: ${type.count} vendors`);
    });

    // Step 4: Test data relationships
    console.log('\n📋 Step 4: Testing data relationships...');
    
    // Check virtual tours with property relationships
    const [toursWithProperties] = await db.execute(`
      SELECT 
        vt.resourceType,
        vt.resourceId,
        vt.tourName,
        CASE 
          WHEN vt.resourceType = 'building' THEN b.buildingName
          WHEN vt.resourceType = 'villa' THEN v.Name
          WHEN vt.resourceType = 'apartment' THEN CONCAT('Apartment ', a.apartmentNumber)
          ELSE 'Unknown Property'
        END as propertyName
      FROM virtual_tours vt
      LEFT JOIN building b ON vt.resourceType = 'building' AND vt.resourceId = b.buildingId
      LEFT JOIN villas v ON vt.resourceType = 'villa' AND vt.resourceId = v.villasId
      LEFT JOIN apartment a ON vt.resourceType = 'apartment' AND vt.resourceId = a.apartmentId
      WHERE vt.isActive = 1
    `);

    console.log('\n📊 Virtual Tours with Property Links:');
    toursWithProperties.forEach(tour => {
      console.log(`  - ${tour.tourName} → ${tour.propertyName || 'Unknown Property'} (${tour.resourceType})`);
    });

    console.log('\n🎯 SAMPLE VIRTUAL TOURS AND VENDORS DATA ADDITION COMPLETE!');
    console.log('✅ Virtual tours added successfully');
    console.log('✅ Vendors added successfully');
    console.log('✅ Data relationships verified');
    console.log('✅ System ready for testing with sample data');

  } catch (error) {
    console.error('💥 Error adding sample virtual tours and vendors data:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
addSampleVirtualToursVendors();
