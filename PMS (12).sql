-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 37.27.187.4:3306
-- Generation Time: Jul 14, 2025 at 07:23 AM
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
(23, 32, 1, 1, 700, 800, 6000, 'Rented', 'Luxury Apartment'),
(24, 32, 1, 1, 500, 600, 5000, 'Vacant', 'Luxury');

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
(30, 23, 'Loundry'),
(31, 23, 'House keeping'),
(32, 23, 'Internet'),
(33, 24, 'Internet');

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
(16, 15, 23, '2025-07-12 09:03:23');

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
(32, 23, '/public/uploads/apartments/apartment-1752310780891-649795639.jpeg', '2025-07-12 08:59:59'),
(33, 23, '/public/uploads/apartments/apartment-1752310780891-988331408.jpeg', '2025-07-12 08:59:59'),
(34, 24, '/public/uploads/apartments/apartment-1752310852403-231417157.avif', '2025-07-12 09:01:07'),
(35, 24, '/public/uploads/apartments/apartment-1752310852402-297950159.jpeg', '2025-07-12 09:01:07');

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
(16, 'Makkah Clock Tower', 'Sudia', '2025-07-12');

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
(11, 16, '/public/uploads/buildings/building-1752310780889-738532039.jpg', '2025-07-12 08:59:54');

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
(10, '0', 10, '2025-07-12', '2026-08-12', '2025-07-12 06:58:17'),
(12, '0', 12, '2025-07-12', '2025-07-12', '2025-07-12 07:16:55'),
(13, '0', 13, '2025-07-12', '2026-11-25', '2025-07-12 07:42:01'),
(14, '0', 14, '2025-07-12', '2026-07-12', '2025-07-12 07:49:47'),
(15, '0', 15, '2025-07-12', '2026-07-16', '2025-07-12 09:03:24');

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
(9, 10, 19),
(11, 12, 19),
(12, 13, 19),
(13, 14, 19),
(14, 15, 23);

-- --------------------------------------------------------

--
-- Table structure for table `FinancialTransactions`
--

CREATE TABLE `FinancialTransactions` (
  `transactionId` varchar(36) NOT NULL,
  `tenantId` int DEFAULT NULL,
  `apartmentId` int DEFAULT NULL,
  `contractId` int DEFAULT NULL,
  `transactionType` enum('Rent Payment','Security Deposit','Maintenance Fee','Utility Payment','Late Fee','Refund','Other') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'AED',
  `paymentMethod` enum('Bank Transfer','Credit Card','Cash','Cheque','Online Payment') NOT NULL,
  `transactionDate` date NOT NULL,
  `dueDate` date DEFAULT NULL,
  `status` enum('Pending','Completed','Failed','Cancelled','Refunded') NOT NULL DEFAULT 'Pending',
  `description` text,
  `referenceNumber` varchar(100) DEFAULT NULL,
  `receiptPath` varchar(500) DEFAULT NULL,
  `processingFee` decimal(8,2) DEFAULT '0.00',
  `lateFee` decimal(8,2) DEFAULT '0.00',
  `billingPeriodStart` date DEFAULT NULL,
  `billingPeriodEnd` date DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `FinancialTransactions`
--

INSERT INTO `FinancialTransactions` (`transactionId`, `tenantId`, `apartmentId`, `contractId`, `transactionType`, `amount`, `currency`, `paymentMethod`, `transactionDate`, `dueDate`, `status`, `description`, `referenceNumber`, `receiptPath`, `processingFee`, `lateFee`, `billingPeriodStart`, `billingPeriodEnd`, `createdBy`, `createdAt`, `updatedAt`) VALUES
('b5ee181b-c01a-4407-ad31-d71752c04ac2', 15, 23, 15, 'Rent Payment', 6000.00, 'AED', 'Bank Transfer', '2025-07-12', NULL, 'Completed', 'Monthly rent payment for 2025-07-12 to 2025-07-13', 'TXN-250712-3618', NULL, 5.00, 0.00, '2025-07-12', '2025-07-13', 2, '2025-07-12 13:09:22', '2025-07-12 13:09:22');

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
(32, 16, 'F101'),
(33, 16, 'F102');

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
-- Table structure for table `PaymentSchedule`
--

CREATE TABLE `PaymentSchedule` (
  `scheduleId` int NOT NULL,
  `contractId` int NOT NULL,
  `tenantId` int NOT NULL,
  `apartmentId` int NOT NULL,
  `paymentType` enum('Monthly Rent','Quarterly Rent','Yearly Rent','Security Deposit') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `dueDate` date NOT NULL,
  `status` enum('Pending','Paid','Overdue','Cancelled') NOT NULL DEFAULT 'Pending',
  `transactionId` varchar(36) DEFAULT NULL,
  `generatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permissionId` int NOT NULL,
  `permissionName` varchar(100) NOT NULL,
  `resource` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permissionId`, `permissionName`, `resource`, `action`, `description`, `createdAt`) VALUES
(1, 'dashboard.view', 'dashboard', 'view', 'View dashboard', '2025-07-10 18:53:23'),
(2, 'villas.view', 'villas', 'view', 'View all villas', '2025-07-10 18:53:23'),
(3, 'villas.view_own', 'villas', 'view_own', 'View own assigned villas', '2025-07-10 18:53:24'),
(4, 'villas.create', 'villas', 'create', 'Create new villas', '2025-07-10 18:53:24'),
(5, 'villas.update', 'villas', 'update', 'Update villa information', '2025-07-10 18:53:24'),
(6, 'villas.update_own', 'villas', 'update_own', 'Update own assigned villas', '2025-07-10 18:53:25'),
(7, 'villas.delete', 'villas', 'delete', 'Delete villas', '2025-07-10 18:53:25'),
(8, 'villas.assign', 'villas', 'assign', 'Assign villas to owners', '2025-07-10 18:53:25'),
(9, 'buildings.view', 'buildings', 'view', 'View buildings', '2025-07-10 18:53:25'),
(10, 'buildings.view_own', 'buildings', 'view_own', 'View own assigned buildings', '2025-07-10 18:53:25'),
(11, 'buildings.update_own', 'buildings', 'update_own', 'Update own assigned buildings', '2025-07-10 18:53:26'),
(12, 'tenants.view_own', 'tenants', 'view_own', 'View tenants in own properties', '2025-07-10 18:53:26'),
(13, 'permissions.view', 'permissions', 'view', 'View permissions', '2025-07-10 19:04:36'),
(14, 'permissions.create', 'permissions', 'create', 'Create new permissions', '2025-07-10 19:04:36'),
(15, 'permissions.update', 'permissions', 'update', 'Update permissions', '2025-07-10 19:04:36'),
(16, 'permissions.delete', 'permissions', 'delete', 'Delete permissions', '2025-07-10 19:04:36'),
(17, 'permissions.assign', 'permissions', 'assign', 'Assign permissions to roles', '2025-07-10 19:04:37'),
(18, 'roles.view', 'roles', 'view', 'View roles', '2025-07-10 19:04:37'),
(19, 'roles.create', 'roles', 'create', 'Create new roles', '2025-07-10 19:04:37'),
(20, 'roles.update', 'roles', 'update', 'Update roles', '2025-07-10 19:04:37'),
(21, 'roles.delete', 'roles', 'delete', 'Delete roles', '2025-07-10 19:04:38'),
(22, 'users.view', 'users', 'view', 'View users', '2025-07-10 19:15:50'),
(23, 'users.create', 'users', 'create', 'Create new users', '2025-07-10 19:15:50'),
(24, 'users.update', 'users', 'update', 'Update users', '2025-07-10 19:15:50'),
(25, 'users.delete', 'users', 'delete', 'Delete users', '2025-07-10 19:15:51'),
(26, 'vendors.view', 'vendors', 'view', 'View vendors', '2025-07-10 19:15:51'),
(27, 'vendors.create', 'vendors', 'create', 'Create new vendors', '2025-07-10 19:15:51'),
(28, 'vendors.update', 'vendors', 'update', 'Update vendors', '2025-07-10 19:15:51'),
(29, 'vendors.delete', 'vendors', 'delete', 'Delete vendors', '2025-07-10 19:15:52'),
(30, 'transactions.view', 'transactions', 'view', 'View all transactions', '2025-07-10 19:15:52'),
(31, 'transactions.view_own', 'transactions', 'view_own', 'View own property transactions', '2025-07-10 19:15:52'),
(32, 'transactions.create', 'transactions', 'create', 'Create new transactions', '2025-07-10 19:15:52'),
(33, 'transactions.update', 'transactions', 'update', 'Update transactions', '2025-07-10 19:15:53'),
(34, 'transactions.delete', 'transactions', 'delete', 'Delete transactions', '2025-07-10 19:15:53'),
(35, 'messages.view', 'messages', 'view', 'View messages', '2025-07-10 19:15:53'),
(36, 'messages.create', 'messages', 'create', 'Send messages', '2025-07-10 19:15:53'),
(37, 'messages.update', 'messages', 'update', 'Update messages', '2025-07-10 19:15:54'),
(38, 'messages.delete', 'messages', 'delete', 'Delete messages', '2025-07-10 19:15:54'),
(39, 'tenant.create', 'tenants', 'create', 'create tenants', '2025-07-10 19:55:28'),
(41, 'apartments.view', 'apartments', 'view', 'View all apartments', '2025-07-10 20:15:11'),
(42, 'apartments.view_own', 'apartments', 'view_own', 'View apartments in own buildings', '2025-07-10 20:15:12'),
(43, 'apartments.create', 'apartments', 'create', 'Create new apartments', '2025-07-10 20:15:12'),
(44, 'apartments.update', 'apartments', 'update', 'Update apartments', '2025-07-10 20:15:12'),
(45, 'apartments.update_own', 'apartments', 'update_own', 'Update apartments in own buildings', '2025-07-10 20:15:12'),
(46, 'apartments.delete', 'apartments', 'delete', 'Delete apartments', '2025-07-10 20:15:13');

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
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `rolePermissionId` int NOT NULL,
  `roleId` int NOT NULL,
  `permissionId` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`rolePermissionId`, `roleId`, `permissionId`, `createdAt`) VALUES
(73, 1, 43, '2025-07-10 20:28:20'),
(74, 1, 46, '2025-07-10 20:28:20'),
(75, 1, 44, '2025-07-10 20:28:20'),
(76, 1, 45, '2025-07-10 20:28:20'),
(77, 1, 41, '2025-07-10 20:28:20'),
(78, 1, 42, '2025-07-10 20:28:20'),
(79, 1, 11, '2025-07-10 20:28:20'),
(80, 1, 9, '2025-07-10 20:28:20'),
(81, 1, 10, '2025-07-10 20:28:20'),
(82, 1, 1, '2025-07-10 20:28:20'),
(83, 1, 36, '2025-07-10 20:28:20'),
(84, 1, 38, '2025-07-10 20:28:20'),
(85, 1, 37, '2025-07-10 20:28:20'),
(86, 1, 35, '2025-07-10 20:28:20'),
(87, 1, 17, '2025-07-10 20:28:20'),
(88, 1, 14, '2025-07-10 20:28:20'),
(89, 1, 16, '2025-07-10 20:28:20'),
(90, 1, 15, '2025-07-10 20:28:20'),
(91, 1, 13, '2025-07-10 20:28:20'),
(92, 1, 19, '2025-07-10 20:28:20'),
(93, 1, 21, '2025-07-10 20:28:20'),
(94, 1, 20, '2025-07-10 20:28:20'),
(95, 1, 18, '2025-07-10 20:28:20'),
(96, 1, 12, '2025-07-10 20:28:20'),
(97, 1, 32, '2025-07-10 20:28:20'),
(98, 1, 34, '2025-07-10 20:28:20'),
(99, 1, 33, '2025-07-10 20:28:20'),
(100, 1, 30, '2025-07-10 20:28:20'),
(101, 1, 31, '2025-07-10 20:28:20'),
(102, 1, 23, '2025-07-10 20:28:20'),
(103, 1, 25, '2025-07-10 20:28:20'),
(104, 1, 24, '2025-07-10 20:28:20'),
(105, 1, 22, '2025-07-10 20:28:20'),
(106, 1, 27, '2025-07-10 20:28:20'),
(107, 1, 29, '2025-07-10 20:28:20'),
(108, 1, 28, '2025-07-10 20:28:20'),
(109, 1, 26, '2025-07-10 20:28:20'),
(110, 1, 8, '2025-07-10 20:28:20'),
(111, 1, 4, '2025-07-10 20:28:20'),
(112, 1, 7, '2025-07-10 20:28:20'),
(113, 1, 5, '2025-07-10 20:28:20'),
(114, 1, 6, '2025-07-10 20:28:20'),
(115, 1, 2, '2025-07-10 20:28:20'),
(116, 1, 3, '2025-07-10 20:28:20'),
(130, 2, 42, '2025-07-14 06:26:12'),
(131, 2, 11, '2025-07-14 06:26:12'),
(132, 2, 10, '2025-07-14 06:26:12'),
(133, 2, 1, '2025-07-14 06:26:12'),
(134, 2, 36, '2025-07-14 06:26:12'),
(135, 2, 35, '2025-07-14 06:26:12'),
(136, 2, 39, '2025-07-14 06:26:12'),
(137, 2, 12, '2025-07-14 06:26:12'),
(138, 2, 31, '2025-07-14 06:26:12'),
(139, 2, 6, '2025-07-14 06:26:12'),
(140, 2, 3, '2025-07-14 06:26:12'),
(141, 2, 43, '2025-07-14 06:26:12');

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
(15, 23, '100103943034', '2026-10-12', 'Doctor', '/public/uploads/tenants/ejari/ejariDocument-1752310999080-615148057.avif', '2025-07-12 09:03:22');

-- --------------------------------------------------------

--
-- Table structure for table `TenantPaymentHistory`
--

CREATE TABLE `TenantPaymentHistory` (
  `paymentHistoryId` int NOT NULL,
  `tenantId` int NOT NULL,
  `apartmentId` int NOT NULL,
  `contractId` int DEFAULT NULL,
  `transactionId` varchar(36) NOT NULL,
  `paymentMonth` date NOT NULL,
  `rentAmount` decimal(10,2) NOT NULL,
  `lateFee` decimal(8,2) DEFAULT '0.00',
  `totalPaid` decimal(10,2) NOT NULL,
  `paymentDate` date NOT NULL,
  `paymentMethod` enum('Bank Transfer','Credit Card','Cash','Cheque','Online Payment') NOT NULL,
  `status` enum('On Time','Late','Partial','Failed') NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `TenantPaymentHistory`
--

INSERT INTO `TenantPaymentHistory` (`paymentHistoryId`, `tenantId`, `apartmentId`, `contractId`, `transactionId`, `paymentMonth`, `rentAmount`, `lateFee`, `totalPaid`, `paymentDate`, `paymentMethod`, `status`, `notes`, `createdAt`) VALUES
(10, 15, 23, 15, 'b5ee181b-c01a-4407-ad31-d71752c04ac2', '2025-07-12', 6000.00, 0.00, 6000.00, '2025-07-12', 'Bank Transfer', 'On Time', NULL, '2025-07-12 13:09:22');

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
(2, 'Anas', 'khan', 'admin@gmail.com', '$2a$12$TrFaQP0ys/iJhvpLiYHCteKcY7.0u2TCpM1vazT4wJPndinmQY2i6', '0034324324', 'mardan', 'male', '/public/uploads/users/image-1751711856683-874329220.jpg', 'pakistani', '1999-01-01', '2025-07-05 10:37:42'),
(17, 'owner', 'portal', 'owner@gmail.com', '$2a$12$3qhM9s076sXemQSdoMQjCO/0dMB2ksI.b1pcJNzGblb6TZddMorMm', '03100963297', 'owner portal', 'Male', '', 'pakistani', '1995-06-06', '2025-07-12 06:35:56'),
(21, 'Ali', 'Ahmed', 'ali@gmail.com', '$2a$12$diAoiBtP7epy53cW2dvJUuglGdNZzUbid9S9LmNtvWEwdw7LzKU0S', '03100963297', 'P/O Has Hinj Tehsil Kariya Zilla Gujrat', 'Male', '', 'pakistani', '1993-06-08', '2025-07-12 07:42:00'),
(23, 'Ali', 'Ahmed', 'ali@gmail.com', '$2a$12$4DWxyiPm/Vo3D1aQwmy3U.eYfM0i5QR7sZW9q2Lp3do77weY9vT6C', '2342342342', 'Islamabad', 'Male', '', 'pakistani', '1992-02-12', '2025-07-12 09:03:22');

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
(2, 2, 1),
(7, 17, 2);

-- --------------------------------------------------------

--
-- Table structure for table `villaImages`
--

CREATE TABLE `villaImages` (
  `imageId` int NOT NULL,
  `villaId` int NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `villaImages`
--

INSERT INTO `villaImages` (`imageId`, `villaId`, `imageUrl`, `createdAt`) VALUES
(12, 8, '/public/uploads/villas/villa-1752307872034-564151154.avif', '2025-07-12 08:11:13');

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

--
-- Dumping data for table `villas`
--

INSERT INTO `villas` (`villasId`, `Name`, `Address`, `bedrooms`, `bathrooms`, `length`, `width`, `price`, `description`, `yearOfCreation`, `status`, `createdAt`) VALUES
(8, 'Luxury Desert Oasis Villa', 'Sudia', 8, 9, 12000, 13000, 200000, 'villa', '1991-01-29', 'Sold', '2025-07-12 08:11:12');

-- --------------------------------------------------------

--
-- Table structure for table `villasAssigned`
--

CREATE TABLE `villasAssigned` (
  `assignId` int NOT NULL,
  `villaId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `villasAssigned`
--

INSERT INTO `villasAssigned` (`assignId`, `villaId`, `userId`, `createdAt`) VALUES
(2, 8, 17, '2025-07-12 09:13:43');

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
-- Dumping data for table `villasFeature`
--

INSERT INTO `villasFeature` (`featureId`, `villaId`, `features`) VALUES
(12, 8, 'pool');

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
-- Indexes for table `FinancialTransactions`
--
ALTER TABLE `FinancialTransactions`
  ADD PRIMARY KEY (`transactionId`),
  ADD KEY `idx_tenant_id` (`tenantId`),
  ADD KEY `idx_apartment_id` (`apartmentId`),
  ADD KEY `idx_contract_id` (`contractId`),
  ADD KEY `idx_transaction_date` (`transactionDate`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_transaction_type` (`transactionType`),
  ADD KEY `fk_financial_created_by` (`createdBy`);

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
-- Indexes for table `PaymentSchedule`
--
ALTER TABLE `PaymentSchedule`
  ADD PRIMARY KEY (`scheduleId`),
  ADD KEY `idx_contract_id` (`contractId`),
  ADD KEY `idx_tenant_id` (`tenantId`),
  ADD KEY `idx_apartment_id` (`apartmentId`),
  ADD KEY `idx_due_date` (`dueDate`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_schedule_transaction` (`transactionId`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permissionId`),
  ADD UNIQUE KEY `permissionName` (`permissionName`),
  ADD KEY `idx_resource_action` (`resource`,`action`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`roleId`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`rolePermissionId`),
  ADD UNIQUE KEY `unique_role_permission` (`roleId`,`permissionId`),
  ADD KEY `fk_role_permissions_permission` (`permissionId`);

--
-- Indexes for table `tenant`
--
ALTER TABLE `tenant`
  ADD PRIMARY KEY (`tenantId`);

--
-- Indexes for table `TenantPaymentHistory`
--
ALTER TABLE `TenantPaymentHistory`
  ADD PRIMARY KEY (`paymentHistoryId`),
  ADD KEY `idx_tenant_id` (`tenantId`),
  ADD KEY `idx_apartment_id` (`apartmentId`),
  ADD KEY `idx_contract_id` (`contractId`),
  ADD KEY `idx_payment_month` (`paymentMonth`),
  ADD KEY `idx_payment_date` (`paymentDate`),
  ADD KEY `fk_payment_history_transaction` (`transactionId`);

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
-- Indexes for table `villasAssigned`
--
ALTER TABLE `villasAssigned`
  ADD PRIMARY KEY (`assignId`),
  ADD KEY `fk_villa_assigned_villa` (`villaId`),
  ADD KEY `fk_villa_assigned_user` (`userId`);

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
  MODIFY `apartmentId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `apartmentAmenities`
--
ALTER TABLE `apartmentAmenities`
  MODIFY `amenitiesId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `ApartmentAssigned`
--
ALTER TABLE `ApartmentAssigned`
  MODIFY `apartmentAssignedId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `apartmentImages`
--
ALTER TABLE `apartmentImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `building`
--
ALTER TABLE `building`
  MODIFY `buildingId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `buildingAssigned`
--
ALTER TABLE `buildingAssigned`
  MODIFY `buildingAssignedId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `buildingImage`
--
ALTER TABLE `buildingImage`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `Contract`
--
ALTER TABLE `Contract`
  MODIFY `contractId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `ContractDetails`
--
ALTER TABLE `ContractDetails`
  MODIFY `contractDetailsId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `floor`
--
ALTER TABLE `floor`
  MODIFY `floorId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `floorImages`
--
ALTER TABLE `floorImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `PaymentSchedule`
--
ALTER TABLE `PaymentSchedule`
  MODIFY `scheduleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permissionId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `roleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `rolePermissionId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=142;

--
-- AUTO_INCREMENT for table `tenant`
--
ALTER TABLE `tenant`
  MODIFY `tenantId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `TenantPaymentHistory`
--
ALTER TABLE `TenantPaymentHistory`
  MODIFY `paymentHistoryId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `userRole`
--
ALTER TABLE `userRole`
  MODIFY `userRoleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `villaImages`
--
ALTER TABLE `villaImages`
  MODIFY `imageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `villas`
--
ALTER TABLE `villas`
  MODIFY `villasId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `villasAssigned`
--
ALTER TABLE `villasAssigned`
  MODIFY `assignId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `villasFeature`
--
ALTER TABLE `villasFeature`
  MODIFY `featureId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `buildingImage`
--
ALTER TABLE `buildingImage`
  ADD CONSTRAINT `fk_building_image_building` FOREIGN KEY (`buildingId`) REFERENCES `building` (`buildingId`) ON DELETE CASCADE;

--
-- Constraints for table `FinancialTransactions`
--
ALTER TABLE `FinancialTransactions`
  ADD CONSTRAINT `fk_financial_apartment` FOREIGN KEY (`apartmentId`) REFERENCES `apartment` (`apartmentId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_financial_contract` FOREIGN KEY (`contractId`) REFERENCES `Contract` (`contractId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_financial_created_by` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_financial_tenant` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`tenantId`) ON DELETE SET NULL;

--
-- Constraints for table `floorImages`
--
ALTER TABLE `floorImages`
  ADD CONSTRAINT `fk_floor_image_floor` FOREIGN KEY (`floorId`) REFERENCES `floor` (`floorId`) ON DELETE CASCADE;

--
-- Constraints for table `PaymentSchedule`
--
ALTER TABLE `PaymentSchedule`
  ADD CONSTRAINT `fk_schedule_apartment` FOREIGN KEY (`apartmentId`) REFERENCES `apartment` (`apartmentId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_schedule_contract` FOREIGN KEY (`contractId`) REFERENCES `Contract` (`contractId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_schedule_tenant` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`tenantId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_schedule_transaction` FOREIGN KEY (`transactionId`) REFERENCES `FinancialTransactions` (`transactionId`) ON DELETE SET NULL;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`permissionId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`roleId`) ON DELETE CASCADE;

--
-- Constraints for table `TenantPaymentHistory`
--
ALTER TABLE `TenantPaymentHistory`
  ADD CONSTRAINT `fk_payment_history_apartment` FOREIGN KEY (`apartmentId`) REFERENCES `apartment` (`apartmentId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_history_contract` FOREIGN KEY (`contractId`) REFERENCES `Contract` (`contractId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_history_tenant` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`tenantId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_history_transaction` FOREIGN KEY (`transactionId`) REFERENCES `FinancialTransactions` (`transactionId`) ON DELETE CASCADE;

--
-- Constraints for table `villasAssigned`
--
ALTER TABLE `villasAssigned`
  ADD CONSTRAINT `fk_villa_assigned_user` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_villa_assigned_villa` FOREIGN KEY (`villaId`) REFERENCES `villas` (`villasId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
