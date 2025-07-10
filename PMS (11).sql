-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 37.27.187.4:3306
-- Generation Time: Jul 10, 2025 at 11:04 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `PMS`
--

-- --------------------------------------------------------

--
-- Table structure for table `apartment`
--

CREATE TABLE `apartment` (
  `apartmentId` int NOT NULL,
  `floorId` int NOT NULL,
  `bedrooms` int NOT NULL,
  `bathrooms` int NOT NULL,
  `length` int NOT NULL,
  `width` int NOT NULL,
  `rentPrice` int NOT NULL,
  `status` enum('Vacant','Rented') NOT NULL,
  `description` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `apartment`
--

INSERT INTO `apartment` (`apartmentId`, `floorId`, `bedrooms`, `bathrooms`, `length`, `width`, `rentPrice`, `status`, `description`) VALUES
(1, 1, 1, 1, 500, 400, 2500, 'Vacant', ''),
(2, 1, 2, 2, 800, 600, 3500, 'Vacant', ''),
(3, 2, 1, 1, 500, 400, 2600, 'Vacant', ''),
(4, 2, 2, 2, 800, 600, 3600, 'Vacant', ''),
(5, 3, 3, 2, 1000, 800, 4500, 'Vacant', ''),
(6, 4, 1, 1, 450, 350, 2200, 'Vacant', ''),
(7, 5, 2, 2, 750, 550, 3200, 'Vacant', ''),
(8, 9, 1, 1, 500, 600, 3000, 'Vacant', 'Hi This is mingal'),
(9, 12, 1, 1, 500, 1000, 2000, 'Vacant', 'Hi'),
(10, 14, 1, 1, 5555, 5555, 23232, 'Vacant', 'sasas'),
(11, 15, 1, 1, 213, 211, 213, 'Vacant', 'sad'),
(12, 16, 1, 1, 50000, 10000, 33443, 'Vacant', 'kkkk'),
(13, 17, 1, 1, 615, 630, 8000, 'Vacant', 'A loft apartment bedroom is typically a designated sleeping area within a loft-style apartment, often situated on a mezzanine level or a raised platform that overlooks the main living space. It\'s characterized by its open and flexible design, with the sleeping area potentially lacking full walls and doors, creating a visually connected yet distinct space. '),
(14, 20, 1, 1, 615, 630, 8000, 'Rented', 'A loft apartment bedroom is typically a designated sleeping area within a loft-style apartment, often situated on a mezzanine level or a raised platform that overlooks the main living space. It\'s characterized by its open and flexible design, with the sleeping area potentially lacking full walls and doors, creating a visually connected yet distinct space. '),
(15, 23, 1, 1, 400, 200, 2000, 'Vacant', 'Several iconic buildings in Saudi Arabia include the Makkah Royal Clock Tower, Kingdom Centre Tower, Al Faisaliah Tower, and the Abraj Al Bait Towers. Also notable are the Jeddah Tower (under construction), PIF Tower (formerly CMA Tower), and Maraya, the largest mirrored building. '),
(16, 24, 1, 1, 400, 500, 2000, 'Rented', 'Apartment'),
(17, 23, 1, 1, 600, 600, 399, 'Vacant', 'New Apartment'),
(18, 24, 1, 1, 324, 324, 3232, 'Vacant', 'sad');

-- --------------------------------------------------------

--
-- Table structure for table `apartmentAmenities`
--

CREATE TABLE `apartmentAmenities` (
  `amenitiesId` int NOT NULL,
  `apartmentId` int NOT NULL,
  `amenityName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `apartmentAmenities`
--

INSERT INTO `apartmentAmenities` (`amenitiesId`, `apartmentId`, `amenityName`) VALUES
(1, 4, 'High Speed Internet'),
(2, 4, 'Balcakni'),
(9, 13, 'Loundry'),
(10, 14, 'High Speed Internet'),
(11, 15, 'Loundry'),
(12, 15, 'High Speen Internet'),
(13, 17, 'High Speed Internet'),
(14, 17, 'Loundry'),
(15, 16, 'Loundry'),
(16, 16, 'Internet'),
(17, 18, '332');

-- --------------------------------------------------------

--
-- Table structure for table `ApartmentAssigned`
--

CREATE TABLE `ApartmentAssigned` (
  `apartmentAssignedId` int NOT NULL,
  `tenantId` int NOT NULL,
  `apartmentId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ApartmentAssigned`
--

INSERT INTO `ApartmentAssigned` (`apartmentAssignedId`, `tenantId`, `apartmentId`, `createdAt`) VALUES
(6, 4, 14, '2025-07-09 06:27:48'),
(7, 6, 13, '2025-07-09 11:52:31'),
(8, 7, 16, '2025-07-09 14:46:01');

-- --------------------------------------------------------

--
-- Table structure for table `apartmentImages`
--

CREATE TABLE `apartmentImages` (
  `imageId` int NOT NULL,
  `apartmentId` int NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `apartmentImages`
--

INSERT INTO `apartmentImages` (`imageId`, `apartmentId`, `imageUrl`, `createdAt`) VALUES
(3, 13, '/public/uploads/apartments/apartment-1751967933981-984657582.jpeg', '2025-07-08 09:45:38'),
(4, 13, '/public/uploads/apartments/apartment-1751967933981-882206665.jpg', '2025-07-08 09:45:38'),
(5, 13, '/public/uploads/apartments/apartment-1751967933985-304493810.avif', '2025-07-08 09:45:38'),
(6, 13, '/public/uploads/apartments/apartment-1751967933984-601416174.jpeg', '2025-07-08 09:45:38'),
(7, 13, '/public/uploads/apartments/apartment-1751967933985-857983835.webp', '2025-07-08 09:45:39'),
(8, 14, '/public/uploads/apartments/apartment-1751968028348-730427963.jpeg', '2025-07-08 09:47:12'),
(9, 14, '/public/uploads/apartments/apartment-1751968028347-710295000.jpg', '2025-07-08 09:47:12'),
(10, 14, '/public/uploads/apartments/apartment-1751968028349-409078765.avif', '2025-07-08 09:47:12'),
(11, 14, '/public/uploads/apartments/apartment-1751968028346-834254535.jpeg', '2025-07-08 09:47:12'),
(12, 14, '/public/uploads/apartments/apartment-1751968028346-194797670.jpeg', '2025-07-08 09:47:12'),
(13, 14, '/public/uploads/apartments/apartment-1751968028349-423691123.webp', '2025-07-08 09:47:13'),
(14, 15, '/public/uploads/apartments/apartment-1751970267792-419336252.jpeg', '2025-07-08 10:24:30'),
(15, 15, '/public/uploads/apartments/apartment-1751970267792-931764768.avif', '2025-07-08 10:24:31'),
(16, 15, '/public/uploads/apartments/apartment-1751970267792-903671067.jpeg', '2025-07-08 10:24:31'),
(17, 16, '/public/uploads/apartments/apartment-1752000614255-660259949.jpeg', '2025-07-08 18:50:22'),
(18, 16, '/public/uploads/apartments/apartment-1752000614255-909019877.jpeg', '2025-07-08 18:50:22'),
(19, 17, '/public/uploads/apartments/apartment-1752072463487-755990972.jpeg', '2025-07-09 14:47:50'),
(20, 17, '/public/uploads/apartments/apartment-1752072463487-150877178.jpeg', '2025-07-09 14:47:50'),
(21, 17, '/public/uploads/apartments/apartment-1752072463488-998523724.jpg', '2025-07-09 14:47:51'),
(22, 18, '/public/uploads/apartments/apartment-1752072552903-304988317.jpeg', '2025-07-09 14:49:21');

-- --------------------------------------------------------

--
-- Table structure for table `building`
--

CREATE TABLE `building` (
  `buildingId` int NOT NULL,
  `buildingName` varchar(250) NOT NULL,
  `buildingAddress` varchar(250) NOT NULL,
  `buildingCreatedDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `building`
--

INSERT INTO `building` (`buildingId`, `buildingName`, `buildingAddress`, `buildingCreatedDate`) VALUES
(10, 'The kingdom Center Building', 'Saudi Arabia.', '2025-07-08'),
(11, 'Clock Tower', 'Makkah', '2025-07-08'),
(12, 'Al Faisaliah Tower', 'Sudia Jadda', '2025-07-08'),
(13, 'Al Makkha', 'Sudia', '2025-07-08');

-- --------------------------------------------------------

--
-- Table structure for table `buildingAssigned`
--

CREATE TABLE `buildingAssigned` (
  `buildingAssignedId` int NOT NULL,
  `buildingId` int NOT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `buildingAssigned`
--

INSERT INTO `buildingAssigned` (`buildingAssignedId`, `buildingId`, `userId`) VALUES
(1, 11, 10),
(2, 10, 11),
(3, 13, 12),
(4, 10, 12),
(5, 11, 12),
(6, 13, 10);

-- --------------------------------------------------------

--
-- Table structure for table `buildingImage`
--

CREATE TABLE `buildingImage` (
  `imageId` int NOT NULL,
  `buildingId` int NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `buildingImage`
--

INSERT INTO `buildingImage` (`imageId`, `buildingId`, `imageUrl`, `createdAt`) VALUES
(5, 10, '/public/uploads/buildings/building-1751967933980-315595373.jpg', '2025-07-08 09:45:34'),
(6, 11, '/public/uploads/buildings/building-1751968028345-627206351.jpg', '2025-07-08 09:47:09'),
(7, 12, '/public/uploads/buildings/building-1751970267787-830459113.jpg', '2025-07-08 10:24:28'),
(8, 13, '/public/uploads/buildings/building-1752000614254-171078553.avif', '2025-07-08 18:50:16');

-- --------------------------------------------------------

--
-- Table structure for table `Contract`
--

CREATE TABLE `Contract` (
  `contractId` int NOT NULL,
  `SecurityFee` varchar(260) NOT NULL,
  `tenantId` int NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Contract`
--

INSERT INTO `Contract` (`contractId`, `SecurityFee`, `tenantId`, `startDate`, `endDate`, `createdAt`) VALUES
(2, '5000', 3, '2024-01-01', '2024-12-31', '2025-07-05 11:38:41'),
(3, '5000', 4, '2024-01-01', '2024-12-31', '2025-07-06 09:22:15'),
(4, '0', 5, '2025-07-07', '2027-06-08', '2025-07-06 09:26:50'),
(5, '2', 4, '2025-07-09', '2025-07-30', '2025-07-09 06:27:49'),
(6, '0', 6, '2025-07-09', '2029-02-09', '2025-07-09 11:52:32'),
(7, '5000', 7, '2025-07-09', '2026-07-15', '2025-07-09 14:46:02');

-- --------------------------------------------------------

--
-- Table structure for table `ContractDetails`
--

CREATE TABLE `ContractDetails` (
  `contractDetailsId` int NOT NULL,
  `contractId` int NOT NULL,
  `apartmentId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ContractDetails`
--

INSERT INTO `ContractDetails` (`contractDetailsId`, `contractId`, `apartmentId`) VALUES
(1, 2, 1),
(2, 3, 3),
(3, 4, 7),
(4, 5, 14),
(5, 6, 13),
(6, 7, 16);

-- --------------------------------------------------------

--
-- Table structure for table `floor`
--

CREATE TABLE `floor` (
  `floorId` int NOT NULL,
  `buildingId` int NOT NULL,
  `floorName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `floor`
--

INSERT INTO `floor` (`floorId`, `buildingId`, `floorName`) VALUES
(17, 10, 'F001'),
(18, 10, 'F002'),
(19, 10, 'F003'),
(20, 11, 'F001'),
(21, 11, 'F002'),
(22, 11, 'F003'),
(23, 12, 'F001'),
(24, 13, 'F001'),
(25, 13, 'F002');

-- --------------------------------------------------------

--
-- Table structure for table `floorImages`
--

CREATE TABLE `floorImages` (
  `imageId` int NOT NULL,
  `floorId` int NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `roleId` int NOT NULL,
  `roleName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`roleId`, `roleName`) VALUES
(1, 'admin'),
(2, 'owner');

-- --------------------------------------------------------

--
-- Table structure for table `tenant`
--

CREATE TABLE `tenant` (
  `tenantId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `registrationNumber` varchar(250) DEFAULT NULL,
  `registrationExpiry` date DEFAULT NULL,
  `occupation` varchar(250) DEFAULT NULL,
  `ejariPdfPath` varchar(260) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tenant`
--

INSERT INTO `tenant` (`tenantId`, `userId`, `registrationNumber`, `registrationExpiry`, `occupation`, `ejariPdfPath`, `created_at`) VALUES
(4, 8, NULL, NULL, 'Engineer', NULL, '2025-07-06 09:22:14'),
(6, 13, '000000', '2030-10-09', 'software', '/public/uploads/tenants/ejari/ejariDocument-1752061947374-428909756.png', '2025-07-09 11:52:31'),
(7, 14, NULL, NULL, 'Software Developer', NULL, '2025-07-09 14:41:45'),
(8, 15, NULL, NULL, 'Teacher', NULL, '2025-07-09 14:41:46'),
(9, 16, NULL, NULL, 'Doctor', NULL, '2025-07-09 14:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `userId` int NOT NULL,
  `firstName` varchar(250) NOT NULL,
  `lastName` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(300) NOT NULL,
  `phoneNumber` varchar(200) NOT NULL,
  `address` varchar(250) NOT NULL,
  `gender` varchar(250) NOT NULL,
  `image` varchar(250) NOT NULL,
  `nationality` varchar(250) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userId`, `firstName`, `lastName`, `email`, `password`, `phoneNumber`, `address`, `gender`, `image`, `nationality`, `dateOfBirth`, `created_at`) VALUES
(2, 'Anas', 'khan', 'anas@sentrixmedia.com', '$2a$12$TrFaQP0ys/iJhvpLiYHCteKcY7.0u2TCpM1vazT4wJPndinmQY2i6', '0034324324', 'mardan', 'male', '/public/uploads/users/image-1751711856683-874329220.jpg', 'pakistani', '1999-01-01', '2025-07-05 10:37:42'),
(8, 'Test', 'User', 'test.user.new@example.com', '$2a$12$xGfIDngBhLodJYVnzMlBOOy.jqsUZqhEBrX.QjaTTBoCQ.y0dY0vS', '+971501234570', 'Test Address, Dubai', 'Male', '', 'UAE', '1990-01-01', '2025-07-06 09:22:13'),
(10, 'Anas ', 'khan', 'anaskhana122@gmail.com', '$2a$12$q1O7FrFAOzfoD4F0VJDVTuM2wgDxKhiyAG7dIl4sZLdA0EOfTmsp6', '03100963297', 'P/O Has Hinj Tehsil Kariya Zilla Gujrat', 'Male', '/public/uploads/users/image-1751997001966-479787700.jpeg', 'pakistani', '1998-06-09', '2025-07-08 17:50:04'),
(12, 'Test', 'Owner', 'owner@test.com', '$2a$12$ebrCVaYntZt1GU.C3jWHd.ICMX4mEKK6M2DsR4RunNMem7iOCJdpS', '+1234567890', '123 Test Street', 'Male', '/public/uploads/users/default-avatar.png', 'US', '1990-01-01', '2025-07-09 10:40:25'),
(13, 'abbas', '', 'abbas@sentrixmedia.com', '$2a$12$Q0P.Buug5T3.RifTuABb8e/BMUYQCxHnqamkpuJESqr26kAWD3dES', '2342342342343', 'P/O Has Hinj Tehsil Kariya Zilla Gujrat', 'Male', '', 'pakistani', '2027-10-12', '2025-07-09 11:52:30'),
(14, 'John', 'Doe', 'john.doe@test.com', '$2a$12$LSpghss8hr/g0IHTQdOGfuSkDQlmY33Hnyqg2H0JctVyaNtDcs446', '+1234567891', '123 Test Street', 'Male', '/public/uploads/users/default-avatar.png', 'US', '1990-01-01', '2025-07-09 14:41:45'),
(15, 'Jane', 'Smith', 'jane.smith@test.com', '$2a$12$LSpghss8hr/g0IHTQdOGfuSkDQlmY33Hnyqg2H0JctVyaNtDcs446', '+1234567892', '123 Test Street', 'Male', '/public/uploads/users/default-avatar.png', 'UK', '1990-01-01', '2025-07-09 14:41:46'),
(16, 'Ahmed', 'Ali', 'ahmed.ali@test.com', '$2a$12$LSpghss8hr/g0IHTQdOGfuSkDQlmY33Hnyqg2H0JctVyaNtDcs446', '+1234567893', '123 Test Street', 'Male', '/public/uploads/users/default-avatar.png', 'SA', '1990-01-01', '2025-07-09 14:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `userRole`
--

CREATE TABLE `userRole` (
  `userRoleId` int NOT NULL,
  `userId` int NOT NULL,
  `roleId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `userRole`
--

INSERT INTO `userRole` (`userRoleId`, `userId`, `roleId`) VALUES
(1, 1, 1),
(2, 2, 1),
(4, 10, 2),
(6, 12, 2);

-- --------------------------------------------------------

--
-- Table structure for table `villaImages`
--

CREATE TABLE `villaImages` (
  `imageId` int NOT NULL,
  `villaId` int NOT NULL,
  `imagePath` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `villas`
--

CREATE TABLE `villas` (
  `villasId` int NOT NULL,
  `Name` varchar(250) NOT NULL,
  `Address` varchar(250) NOT NULL,
  `bedrooms` int NOT NULL,
  `bathrooms` int NOT NULL,
  `length` int NOT NULL,
  `width` int NOT NULL,
  `price` int NOT NULL,
  `description` varchar(250) NOT NULL,
  `yearOfCreation` date NOT NULL,
  `status` enum('Available','For Sale','For Rent','Sold') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `villasAsigned`
--

CREATE TABLE `villasAsigned` (
  `assignId` int NOT NULL,
  `villaId` int NOT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `villasFeature`
--

CREATE TABLE `villasFeature` (
  `featureId` int NOT NULL,
  `villaId` int NOT NULL,
  `features` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `apartment`
--
ALTER TABLE `apartment`
  ADD PRIMARY KEY (`apartmentId`);

--
-- Indexes for table `apartmentAmenities`
--
ALTER TABLE `apartmentAmenities`
  ADD PRIMARY KEY (`amenitiesId`);

--
-- Indexes for table `ApartmentAssigned`
--
ALTER TABLE `ApartmentAssigned`
  ADD PRIMARY KEY (`apartmentAssignedId`);

--
-- Indexes for table `apartmentImages`
--
ALTER TABLE `apartmentImages`
  ADD PRIMARY KEY (`imageId`),
  ADD KEY `idx_apartment_id` (`apartmentId`);

--
-- Indexes for table `building`
--
ALTER TABLE `building`
  ADD PRIMARY KEY (`buildingId`);

--
-- Indexes for table `buildingAssigned`
--
ALTER TABLE `buildingAssigned`
  ADD PRIMARY KEY (`buildingAssignedId`);

--
-- Indexes for table `buildingImage`
--
ALTER TABLE `buildingImage`
  ADD PRIMARY KEY (`imageId`),
  ADD KEY `idx_building_id` (`buildingId`);

--
-- Indexes for table `Contract`
--
ALTER TABLE `Contract`
  ADD PRIMARY KEY (`contractId`);

--
-- Indexes for table `ContractDetails`
--
ALTER TABLE `ContractDetails`
  ADD PRIMARY KEY (`contractDetailsId`);

--
-- Indexes for table `floor`
--
ALTER TABLE `floor`
  ADD PRIMARY KEY (`floorId`);

--
-- Indexes for table `floorImages`
--
ALTER TABLE `floorImages`
  ADD PRIMARY KEY (`imageId`),
  ADD KEY `idx_floor_id` (`floorId`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`roleId`);

--
-- Indexes for table `tenant`
--
ALTER TABLE `tenant`
  ADD PRIMARY KEY (`tenantId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `userRole`
--
ALTER TABLE `userRole`
  ADD PRIMARY KEY (`userRoleId`);

--
-- Indexes for table `villaImages`
--
ALTER TABLE `villaImages`
  ADD PRIMARY KEY (`imageId`);

--
-- Indexes for table `villas`
--
ALTER TABLE `villas`
  ADD PRIMARY KEY (`villasId`);

--
-- Indexes for table `villasAsigned`
--
ALTER TABLE `villasAsigned`
  ADD PRIMARY KEY (`assignId`);

--
-- Indexes for table `villasFeature`
--
ALTER TABLE `villasFeature`
  ADD PRIMARY KEY (`featureId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `apartment`
--
ALTER TABLE `apartment`
  MODIFY `apartmentId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `apartmentAmenities`
--
ALTER TABLE `apartmentAmenities`
  MODIFY `amenitiesId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `ApartmentAssigned`
--
ALTER TABLE `ApartmentAssigned`
  MODIFY `apartmentAssignedId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `apartmentImages`
--
ALTER TABLE `apartmentImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `building`
--
ALTER TABLE `building`
  MODIFY `buildingId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `buildingAssigned`
--
ALTER TABLE `buildingAssigned`
  MODIFY `buildingAssignedId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `buildingImage`
--
ALTER TABLE `buildingImage`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `Contract`
--
ALTER TABLE `Contract`
  MODIFY `contractId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ContractDetails`
--
ALTER TABLE `ContractDetails`
  MODIFY `contractDetailsId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `floor`
--
ALTER TABLE `floor`
  MODIFY `floorId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `floorImages`
--
ALTER TABLE `floorImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `roleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tenant`
--
ALTER TABLE `tenant`
  MODIFY `tenantId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `userRole`
--
ALTER TABLE `userRole`
  MODIFY `userRoleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `villaImages`
--
ALTER TABLE `villaImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `villas`
--
ALTER TABLE `villas`
  MODIFY `villasId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `villasAsigned`
--
ALTER TABLE `villasAsigned`
  MODIFY `assignId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `villasFeature`
--
ALTER TABLE `villasFeature`
  MODIFY `featureId` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `buildingImage`
--
ALTER TABLE `buildingImage`
  ADD CONSTRAINT `fk_building_image_building` FOREIGN KEY (`buildingId`) REFERENCES `building` (`buildingId`) ON DELETE CASCADE;

--
-- Constraints for table `floorImages`
--
ALTER TABLE `floorImages`
  ADD CONSTRAINT `fk_floor_image_floor` FOREIGN KEY (`floorId`) REFERENCES `floor` (`floorId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
