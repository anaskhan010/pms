-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 37.27.187.4:3306
-- Generation Time: Jul 08, 2025 at 04:43 AM
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
(9, 12, 1, 1, 500, 1000, 2000, 'Vacant', 'Hi');

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
(2, 4, 'Balcakni');

-- --------------------------------------------------------

--
-- Table structure for table `ApartmentAssigned`
--

CREATE TABLE `ApartmentAssigned` (
  `apartmentAssignedId` int NOT NULL,
  `tenantId` int NOT NULL,
  `apartmentId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ApartmentAssigned`
--

INSERT INTO `ApartmentAssigned` (`apartmentAssignedId`, `tenantId`, `apartmentId`) VALUES
(3, 3, 1),
(4, 4, 3),
(5, 5, 7);

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
(1, 'Al Noor Tower', 'Business Bay, Dubai', '2024-01-01'),
(2, 'Marina Heights', 'Dubai Marina, Dubai', '2024-01-01'),
(3, 'Al Makkah Heights', 'Islamabad', '2025-07-07'),
(4, 'Al Makkah Hieght', 'Islamabad', '2025-07-07'),
(5, 'H&S Property', 'Islamabad DHA', '2025-07-07'),
(6, 'New Building', 'Check this ', '2025-07-08');

-- --------------------------------------------------------

--
-- Table structure for table `buildingAssigned`
--

CREATE TABLE `buildingAssigned` (
  `buildingAssignedId` int NOT NULL,
  `buildingId` int NOT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(1, 3, '/public/uploads/buildings/building-1751894934659-302364978.jpg', '2025-07-07 13:28:55'),
(2, 4, '/public/uploads/buildings/building-1751894980165-359325699.jpg', '2025-07-07 13:29:40');

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
(4, '0', 5, '2025-07-07', '2027-06-08', '2025-07-06 09:26:50');

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
(3, 4, 7);

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
(1, 1, 'Ground Floor'),
(2, 1, 'First Floor'),
(3, 1, 'Second Floor'),
(4, 2, 'Ground Floor'),
(5, 2, 'First Floor'),
(6, 3, 'G1 Floor'),
(7, 3, 'G2 Floor'),
(8, 4, 'Ground Floor No 1'),
(9, 5, 'F1'),
(10, 5, 'F2'),
(11, 5, 'F3'),
(12, 6, 'F101'),
(13, 6, 'F102');

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
(1, 'admin');

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
(3, 7, 'REG789012', '2025-12-31', 'Software Engineer', NULL, '2025-07-05 11:38:41'),
(4, 8, NULL, NULL, 'Engineer', NULL, '2025-07-06 09:22:14'),
(5, 9, '000000', '2027-10-19', 'software', '/public/uploads/tenants/ejari/ejariDocument-1751794007051-653292295.png', '2025-07-06 09:26:50');

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
(3, 'Admin', 'User', 'admin@gmail.com', '$2a$12$rDjqy/S44EbJtaSVzhlOXODKMaZo.TJVuwbSoLpOnX63ILfc.wXby', '+971501234567', 'Dubai', 'Male', '', 'UAE', '1990-01-01', '2025-07-05 10:48:26'),
(7, 'Ahmed', 'Al-Rashid', 'ahmed.rashid@example.com', '$2a$12$.WMbvPeZOgPVPoThvndf7.wSaxzGAUVlGc.8tRF4s8OdgnKCt2SHS', '+971501234567', 'Business Bay, Dubai', 'Male', '', 'UAE', '1985-03-15', '2025-07-05 11:38:41'),
(8, 'Test', 'User', 'test.user.new@example.com', '$2a$12$xGfIDngBhLodJYVnzMlBOOy.jqsUZqhEBrX.QjaTTBoCQ.y0dY0vS', '+971501234570', 'Test Address, Dubai', 'Male', '', 'UAE', '1990-01-01', '2025-07-06 09:22:13'),
(9, 'Anas', '', 'mushroom@sentrixmedia.com', '$2a$12$8iB3ibG5C.cEJcqBE4u8mOOpvX4DbWPWgD2m5.7V/SxxXDHfdM1s2', '+1 (000) 000-0000', 'mardan', 'Male', '', 'pakistani', '2001-06-05', '2025-07-06 09:26:50');

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
(3, 3, 1);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `apartment`
--
ALTER TABLE `apartment`
  MODIFY `apartmentId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `apartmentAmenities`
--
ALTER TABLE `apartmentAmenities`
  MODIFY `amenitiesId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ApartmentAssigned`
--
ALTER TABLE `ApartmentAssigned`
  MODIFY `apartmentAssignedId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `apartmentImages`
--
ALTER TABLE `apartmentImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `building`
--
ALTER TABLE `building`
  MODIFY `buildingId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `buildingAssigned`
--
ALTER TABLE `buildingAssigned`
  MODIFY `buildingAssignedId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `buildingImage`
--
ALTER TABLE `buildingImage`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Contract`
--
ALTER TABLE `Contract`
  MODIFY `contractId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ContractDetails`
--
ALTER TABLE `ContractDetails`
  MODIFY `contractDetailsId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `floor`
--
ALTER TABLE `floor`
  MODIFY `floorId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `floorImages`
--
ALTER TABLE `floorImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `roleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tenant`
--
ALTER TABLE `tenant`
  MODIFY `tenantId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `userRole`
--
ALTER TABLE `userRole`
  MODIFY `userRoleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
