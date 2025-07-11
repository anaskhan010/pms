#!/bin/bash

# Financial Transaction API Test Script
BASE_URL="http://localhost:5000/api/v1"

echo "🚀 Testing Financial Transaction API Endpoints"
echo "=============================================="

# Test 1: Get all financial transactions
echo -e "\n📋 Test 1: Get All Financial Transactions"
curl -s -X GET "$BASE_URL/financial/transactions" | jq '.' || echo "❌ Failed to get transactions"

# Test 2: Get financial transaction statistics
echo -e "\n📊 Test 2: Get Financial Transaction Statistics"
curl -s -X GET "$BASE_URL/financial/transactions/statistics" | jq '.' || echo "❌ Failed to get statistics"

# Test 3: Create a new financial transaction
echo -e "\n➕ Test 3: Create Financial Transaction"
curl -s -X POST "$BASE_URL/financial/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 4,
    "apartmentId": 14,
    "contractId": 5,
    "transactionType": "Rent Payment",
    "amount": 2500.00,
    "currency": "AED",
    "paymentMethod": "Bank Transfer",
    "transactionDate": "2025-01-15",
    "status": "Completed",
    "description": "Test monthly rent payment",
    "billingPeriodStart": "2025-01-01",
    "billingPeriodEnd": "2025-01-31"
  }' | jq '.' || echo "❌ Failed to create transaction"

# Test 4: Process rent payment
echo -e "\n💰 Test 4: Process Rent Payment"
curl -s -X POST "$BASE_URL/financial/transactions/rent-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 4,
    "apartmentId": 14,
    "contractId": 5,
    "amount": 2500.00,
    "paymentMethod": "Credit Card",
    "paymentDate": "2025-01-15",
    "billingPeriodStart": "2025-01-01",
    "billingPeriodEnd": "2025-01-31",
    "lateFee": 0
  }' | jq '.' || echo "❌ Failed to process rent payment"

# Test 5: Get tenant payment history
echo -e "\n📜 Test 5: Get Tenant Payment History"
curl -s -X GET "$BASE_URL/financial/transactions/tenant/4/history" | jq '.' || echo "❌ Failed to get tenant payment history"

# Test 6: Get apartment payment history
echo -e "\n🏠 Test 6: Get Apartment Payment History"
curl -s -X GET "$BASE_URL/financial/transactions/apartment/14/history" | jq '.' || echo "❌ Failed to get apartment payment history"

# Test 7: Get payment schedules
echo -e "\n📅 Test 7: Get Payment Schedules"
curl -s -X GET "$BASE_URL/financial/payment-schedules" | jq '.' || echo "❌ Failed to get payment schedules"

# Test 8: Generate monthly payment schedule
echo -e "\n📆 Test 8: Generate Monthly Payment Schedule"
curl -s -X POST "$BASE_URL/financial/payment-schedules/generate-monthly" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": 5,
    "tenantId": 4,
    "apartmentId": 14,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "rentAmount": 2500.00
  }' | jq '.' || echo "❌ Failed to generate monthly schedule"

# Test 9: Get overdue payments
echo -e "\n⏰ Test 9: Get Overdue Payments"
curl -s -X GET "$BASE_URL/financial/payment-schedules/overdue" | jq '.' || echo "❌ Failed to get overdue payments"

# Test 10: Get upcoming payments
echo -e "\n🔔 Test 10: Get Upcoming Payments"
curl -s -X GET "$BASE_URL/financial/payment-schedules/upcoming?days=30" | jq '.' || echo "❌ Failed to get upcoming payments"

# Test 11: Get payment schedule statistics
echo -e "\n📈 Test 11: Get Payment Schedule Statistics"
curl -s -X GET "$BASE_URL/financial/payment-schedules/statistics" | jq '.' || echo "❌ Failed to get payment schedule statistics"

echo -e "\n=============================================="
echo "🎉 Financial Transaction API Tests Completed!"
echo -e "\nNote: Some tests may fail if:"
echo "- The server is not running on port 5000"
echo "- Required test data doesn't exist in the database"
echo "- Authentication is required but not provided"
