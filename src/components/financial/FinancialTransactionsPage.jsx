import { useState, useEffect } from "react";
import adminApiService from "../../services/adminApiService";
import notificationService from "../../services/notificationService";
import { DeleteConfirmationModal } from "../common";
import FinancialTransactionModal from "./FinancialTransactionModal";
import FinancialTransactionFilters from "./FinancialTransactionFilters";
import FinancialTransactionTable from "./FinancialTransactionTable";
import FinancialTransactionSummary from "./FinancialTransactionSummary";

const FinancialTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    transactionId: null,
    transactionDescription: '',
    loading: false
  });

  // Filter states
  const [activeFilters, setActiveFilters] = useState({});
  const [buildings, setBuildings] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Statistics
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [activeFilters, pagination.page, pagination.limit]);

  const loadInitialData = async () => {
    try {
      // For owners, the API endpoints will automatically filter data based on their assignments
      // The backend middleware (getOwnerBuildings) handles the filtering
      const [buildingsRes, tenantsRes, apartmentsRes] = await Promise.all([
        adminApiService.getBuildings(),
        adminApiService.getTenants({ limit: 1000 }),
        adminApiService.getApartments({ limit: 1000 })
      ]);

      if (buildingsRes.success) {
        setBuildings(buildingsRes.data || []);
      }

      if (tenantsRes.success) {
        setTenants(tenantsRes.data || []);
      }

      if (apartmentsRes.success) {
        setApartments(apartmentsRes.data || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        ...activeFilters,
        page: pagination.page,
        limit: pagination.limit
      };

      const [transactionsRes, statisticsRes] = await Promise.all([
        adminApiService.getFinancialTransactions(params),
        adminApiService.getFinancialTransactionStatistics(activeFilters)
      ]);

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
        setFilteredTransactions(transactionsRes.data || []);
        setPagination(prev => ({
          ...prev,
          total: transactionsRes.total || 0,
          pages: transactionsRes.pagination?.pages || 0
        }));
      } else {
        setError(transactionsRes.error);
      }

      if (statisticsRes.success) {
        setStatistics(statisticsRes.data || {});
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (transaction) => {
    setDeleteModal({
      isOpen: true,
      transactionId: transaction.transactionId,
      transactionDescription: transaction.description || `${transaction.transactionType} - AED ${transaction.amount}`,
      loading: false
    });
  };

  const confirmDeleteTransaction = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      
      const response = await adminApiService.deleteFinancialTransaction(deleteModal.transactionId);
      
      if (response.success) {
        notificationService.success('Transaction deleted successfully');
        loadTransactions();
        setDeleteModal({ isOpen: false, transactionId: null, transactionDescription: '', loading: false });
      } else {
        notificationService.error(`Failed to delete transaction: ${response.error}`);
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      notificationService.error('An error occurred while deleting the transaction');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteTransaction = () => {
    setDeleteModal({ isOpen: false, transactionId: null, transactionDescription: '', loading: false });
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      let response;
      
      if (currentTransaction) {
        // Update existing transaction
        response = await adminApiService.updateFinancialTransaction(
          currentTransaction.transactionId,
          transactionData
        );
      } else {
        // Create new transaction
        response = await adminApiService.createFinancialTransaction(transactionData);
      }

      if (response.success) {
        notificationService.success(
          currentTransaction ? 'Transaction updated successfully' : 'Transaction created successfully'
        );
        loadTransactions();
        setIsModalOpen(false);
        setCurrentTransaction(null);
      } else {
        notificationService.error(`Failed to save transaction: ${response.error}`);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      notificationService.error('An error occurred while saving the transaction');
    }
  };

  const handleProcessRentPayment = async (paymentData) => {
    try {
      const response = await adminApiService.processRentPayment(paymentData);
      
      if (response.success) {
        notificationService.success('Rent payment processed successfully');
        loadTransactions();
      } else {
        notificationService.error(`Failed to process rent payment: ${response.error}`);
      }
    } catch (error) {
      console.error('Error processing rent payment:', error);
      notificationService.error('An error occurred while processing the rent payment');
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Loading financial transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Transactions</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadTransactions}
              className="mt-2 text-sm text-red-800 hover:text-red-600 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Financial Transactions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage rent payments, deposits, and other financial transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setCurrentTransaction(null);
              setIsModalOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      {Object.keys(statistics).length > 0 && (
        <FinancialTransactionSummary
          statistics={statistics}
          filters={activeFilters}
        />
      )}

      {/* Filters */}
      <FinancialTransactionFilters
        onFilterChange={handleFilterChange}
        buildings={buildings}
        apartments={apartments}
        tenants={tenants}
      />

      {/* Transactions Table */}
      <FinancialTransactionTable
        transactions={filteredTransactions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Transaction Modal */}
      <FinancialTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onProcessRentPayment={handleProcessRentPayment}
        transaction={currentTransaction}
        buildings={buildings}
        apartments={apartments}
        tenants={tenants}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteTransaction}
        onConfirm={confirmDeleteTransaction}
        title="Delete Financial Transaction"
        message={`Are you sure you want to delete this transaction: "${deleteModal.transactionDescription}"? This action cannot be undone.`}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default FinancialTransactionsPage;
