CREATE TABLE `Properties` (
  `property_id` varchar(255) PRIMARY KEY NOT NULL,
  `property_number` varchar(255),
  `address_line1` varchar(255),
  `address_line2` varchar(255),
  `city` varchar(255),
  `state_province` varchar(255),
  `postal_code` varchar(255),
  `country` varchar(255),
  `plot_size_sqm` decimal,
  `total_units` integer,
  `description` text,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `Units` (
  `unit_id` varchar(255) PRIMARY KEY NOT NULL,
  `property_id` varchar(255) NOT NULL,
  `unit_number` varchar(255),
  `unit_type` varchar(255) COMMENT 'ENUM: Residential, Commercial, Retail',
  `num_bedrooms` integer,
  `num_bathrooms` integer,
  `area_sqm` decimal,
  `current_status` varchar(255) COMMENT 'ENUM: For Sale, For Rent, For Lease, Occupied, Vacant, Maintenance',
  `is_merged` boolean,
  `merged_group_id` varchar(255),
  `description` text,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `Owners` (
  `owner_id` varchar(255) PRIMARY KEY NOT NULL,
  `owner_type` varchar(255) COMMENT 'ENUM: Individual, Company, Bank, RealEstateAgent',
  `name` varchar(255),
  `contact_person` varchar(255),
  `email` varchar(255),
  `phone_number` varchar(255),
  `address` text,
  `id_document_info` text,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `UnitOwnership` (
  `unit_ownership_id` varchar(255) PRIMARY KEY NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `owner_id` varchar(255) NOT NULL,
  `ownership_type` varchar(255) COMMENT 'ENUM: Primary, Bank Collateral, Agent Holding, Fractional',
  `ownership_start_date` date,
  `ownership_end_date` date,
  `loan_details` text,
  `contract_reference` text,
  `is_current` boolean,
  `created_at` timestamp
);

CREATE TABLE `TitleDeedHistory` (
  `deed_history_id` varchar(255) PRIMARY KEY NOT NULL,
  `unit_id` varchar(255),
  `property_id` varchar(255),
  `previous_owner_id` varchar(255),
  `new_owner_id` varchar(255) NOT NULL,
  `transfer_date` date,
  `deed_status_change` varchar(255) COMMENT 'ENUM: Transferred, Renewed, Expired, Loan Transfer, Agent Transfer',
  `effective_date` date,
  `expiry_date` date,
  `remarks` text,
  `recorded_at` timestamp
);

CREATE TABLE `Tenants` (
  `tenant_id` varchar(255) PRIMARY KEY NOT NULL,
  `first_name` varchar(255),
  `last_name` varchar(255),
  `email` varchar(255) UNIQUE,
  `phone_number` varchar(255),
  `nationality` varchar(255),
  `id_document_type` varchar(255) COMMENT 'ENUM: National ID, Passport, Driver License',
  `id_document_number` varchar(255) UNIQUE,
  `date_of_birth` date,
  `emergency_contact_name` varchar(255),
  `emergency_contact_phone` varchar(255),
  `notes` text,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `Contracts` (
  `contract_id` varchar(255) PRIMARY KEY NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `owner_id` varchar(255) NOT NULL,
  `contract_type` varchar(255) COMMENT 'ENUM: Rental, Lease',
  `start_date` date,
  `end_date` date,
  `duration_years` integer,
  `monthly_rent_amount` decimal,
  `currency` varchar(255),
  `payment_frequency` varchar(255) COMMENT 'ENUM: Monthly, Quarterly, Semi-Annually, Annually',
  `grace_period_days` integer DEFAULT 0,
  `default_payment_day_of_month` integer DEFAULT 1,
  `contract_status` varchar(255) COMMENT 'ENUM: Active, Expired, Terminated, Pending',
  `signed_date` date,
  `document_link` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `Invoices` (
  `invoice_id` varchar(255) PRIMARY KEY NOT NULL,
  `contract_id` varchar(255),
  `unit_id` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `invoice_number` varchar(255) UNIQUE,
  `invoice_date` date,
  `due_date` date,
  `billing_period_start` date,
  `billing_period_end` date,
  `total_amount` decimal,
  `amount_due` decimal,
  `currency` varchar(255),
  `invoice_status` varchar(255) COMMENT 'ENUM: Generated, Sent, Paid, Partially Paid, Overdue, Cancelled',
  `generated_at` timestamp
);

CREATE TABLE `Payments` (
  `payment_id` varchar(255) PRIMARY KEY NOT NULL,
  `invoice_id` varchar(255),
  `contract_id` varchar(255),
  `tenant_id` varchar(255) NOT NULL,
  `payment_date` date,
  `payment_amount` decimal,
  `currency` varchar(255),
  `payment_method` varchar(255) COMMENT 'ENUM: Bank Transfer, Cheque, Cash, Credit Card, Online',
  `transaction_reference` varchar(255),
  `is_advance_payment` boolean DEFAULT false,
  `recorded_at` timestamp
);

CREATE TABLE `Utilities` (
  `utility_type_id` varchar(255) PRIMARY KEY NOT NULL,
  `utility_name` varchar(255) UNIQUE,
  `description` text,
  `is_metered` boolean,
  `base_charge` decimal,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `UnitUtilityMeters` (
  `unit_meter_id` varchar(255) PRIMARY KEY NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `utility_type_id` varchar(255) NOT NULL,
  `meter_number` varchar(255),
  `installation_date` date,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `UtilityBills` (
  `utility_bill_id` varchar(255) PRIMARY KEY NOT NULL,
  `unit_meter_id` varchar(255),
  `utility_type_id` varchar(255) NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `tenant_id` varchar(255),
  `owner_id` varchar(255),
  `bill_date` date,
  `due_date` date,
  `reading_start_date` date,
  `reading_end_date` date,
  `previous_reading` decimal,
  `current_reading` decimal,
  `consumption` decimal,
  `amount` decimal,
  `currency` varchar(255),
  `bill_status` varchar(255) COMMENT 'ENUM: Unpaid, Paid, Overdue',
  `invoice_link` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `Tickets` (
  `ticket_id` varchar(255) PRIMARY KEY NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `tenant_id` varchar(255),
  `reporter_type` varchar(255) COMMENT 'ENUM: Tenant, Owner, Manager',
  `category` varchar(255) COMMENT 'ENUM: Plumbing, Electrical, HVAC, General Maintenance, Pest Control, Other',
  `subject` varchar(255),
  `description` text,
  `priority` varchar(255) COMMENT 'ENUM: Low, Medium, High, Urgent',
  `status` varchar(255) COMMENT 'ENUM: Open, Assigned, In Progress, On Hold, Resolved, Closed, Reopened',
  `assigned_to_user_id` varchar(255),
  `opened_at` timestamp,
  `last_updated_at` timestamp,
  `resolved_at` timestamp,
  `closed_at` timestamp
);

CREATE TABLE `TicketComments` (
  `comment_id` varchar(255) PRIMARY KEY NOT NULL,
  `ticket_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `comment_text` text,
  `created_at` timestamp
);

CREATE TABLE `MergedUnits` (
  `merged_group_id` varchar(255) PRIMARY KEY NOT NULL,
  `group_name` varchar(255),
  `primary_owner_id` varchar(255) NOT NULL,
  `primary_tenant_id` varchar(255),
  `description` text,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `MergedUnitComponents` (
  `component_id` varchar(255) PRIMARY KEY NOT NULL,
  `merged_group_id` varchar(255) NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `added_date` date,
  `removed_date` date,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp
);

CREATE TABLE `Users` (
  `user_id` varchar(255) PRIMARY KEY NOT NULL,
  `username` varchar(255),
  `email` varchar(255),
  `role` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE `EjariRegistrations` (
  `ejari_registration_id` varchar(255) PRIMARY KEY NOT NULL,
  `contract_id` varchar(255) NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `ejari_registration_number` varchar(255) UNIQUE,
  `registration_date` date,
  `expiry_date` date,
  `certificate_document_link` varchar(255),
  `status` varchar(255) COMMENT 'ENUM: Registered, Cancelled, Expired',
  `registered_by_user_id` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE UNIQUE INDEX `UnitUtilityMeters_index_0` ON `UnitUtilityMeters` (`unit_id`, `utility_type_id`);

ALTER TABLE `Units` ADD FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`);

ALTER TABLE `UnitOwnership` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `UnitOwnership` ADD FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`owner_id`);

ALTER TABLE `TitleDeedHistory` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `TitleDeedHistory` ADD FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`);

ALTER TABLE `TitleDeedHistory` ADD FOREIGN KEY (`previous_owner_id`) REFERENCES `Owners` (`owner_id`);

ALTER TABLE `TitleDeedHistory` ADD FOREIGN KEY (`new_owner_id`) REFERENCES `Owners` (`owner_id`);

ALTER TABLE `Contracts` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `Contracts` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `Contracts` ADD FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`owner_id`);

ALTER TABLE `Invoices` ADD FOREIGN KEY (`contract_id`) REFERENCES `Contracts` (`contract_id`);

ALTER TABLE `Invoices` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `Invoices` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `Payments` ADD FOREIGN KEY (`invoice_id`) REFERENCES `Invoices` (`invoice_id`);

ALTER TABLE `Payments` ADD FOREIGN KEY (`contract_id`) REFERENCES `Contracts` (`contract_id`);

ALTER TABLE `Payments` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `UnitUtilityMeters` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `UnitUtilityMeters` ADD FOREIGN KEY (`utility_type_id`) REFERENCES `Utilities` (`utility_type_id`);

ALTER TABLE `UtilityBills` ADD FOREIGN KEY (`unit_meter_id`) REFERENCES `UnitUtilityMeters` (`unit_meter_id`);

ALTER TABLE `UtilityBills` ADD FOREIGN KEY (`utility_type_id`) REFERENCES `Utilities` (`utility_type_id`);

ALTER TABLE `UtilityBills` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `UtilityBills` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `UtilityBills` ADD FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`owner_id`);

ALTER TABLE `Tickets` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `Tickets` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `Tickets` ADD FOREIGN KEY (`assigned_to_user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `TicketComments` ADD FOREIGN KEY (`ticket_id`) REFERENCES `Tickets` (`ticket_id`);

ALTER TABLE `TicketComments` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Units` ADD FOREIGN KEY (`merged_group_id`) REFERENCES `MergedUnits` (`merged_group_id`);

ALTER TABLE `MergedUnitComponents` ADD FOREIGN KEY (`merged_group_id`) REFERENCES `MergedUnits` (`merged_group_id`);

ALTER TABLE `MergedUnitComponents` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `MergedUnits` ADD FOREIGN KEY (`primary_owner_id`) REFERENCES `Owners` (`owner_id`);

ALTER TABLE `MergedUnits` ADD FOREIGN KEY (`primary_tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `EjariRegistrations` ADD FOREIGN KEY (`contract_id`) REFERENCES `Contracts` (`contract_id`);

ALTER TABLE `EjariRegistrations` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `EjariRegistrations` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenants` (`tenant_id`);

ALTER TABLE `EjariRegistrations` ADD FOREIGN KEY (`registered_by_user_id`) REFERENCES `Users` (`user_id`);
