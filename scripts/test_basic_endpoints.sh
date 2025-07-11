#!/bin/bash

# Basic Financial Transaction API Test Script (No Auth)
BASE_URL="http://localhost:5000/api/v1"

echo "🚀 Testing Basic Financial Transaction Endpoints"
echo "=============================================="

# Test 1: Get payment schedules (should work without auth issues)
echo -e "\n📅 Test 1: Get Payment Schedules"
curl -s -X GET "$BASE_URL/financial/payment-schedules" | jq '.success, .count, .message' || echo "❌ Failed to get payment schedules"

# Test 2: Get overdue payments
echo -e "\n⏰ Test 2: Get Overdue Payments"
curl -s -X GET "$BASE_URL/financial/payment-schedules/overdue" | jq '.success, .count, .message' || echo "❌ Failed to get overdue payments"

# Test 3: Get upcoming payments
echo -e "\n🔔 Test 3: Get Upcoming Payments"
curl -s -X GET "$BASE_URL/financial/payment-schedules/upcoming?days=30" | jq '.success, .count, .message' || echo "❌ Failed to get upcoming payments"

# Test 4: Get payment schedule statistics
echo -e "\n📈 Test 4: Get Payment Schedule Statistics"
curl -s -X GET "$BASE_URL/financial/payment-schedules/statistics" | jq '.success, .data, .message' || echo "❌ Failed to get payment schedule statistics"

# Test 5: Get all financial transactions
echo -e "\n📋 Test 5: Get All Financial Transactions"
curl -s -X GET "$BASE_URL/financial/transactions" | jq '.success, .count, .error' || echo "❌ Failed to get transactions"

# Test 6: Get financial transaction statistics
echo -e "\n📊 Test 6: Get Financial Transaction Statistics"
curl -s -X GET "$BASE_URL/financial/transactions/statistics" | jq '.success, .data, .error' || echo "❌ Failed to get statistics"

echo -e "\n=============================================="
echo "🎉 Basic Financial Transaction API Tests Completed!"
echo -e "\nNote: Authentication errors are expected for protected endpoints."
