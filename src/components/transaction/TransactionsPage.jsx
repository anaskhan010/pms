import { useState, useEffect } from "react";
import notificationService from "../../services/notificationService";
import { DeleteConfirmationModal } from "../common";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import TransactionModal from "./TransactionModal";
import TransactionSummary from "./TransactionSummary";
import { PermissionButton } from "../auth/PermissionGuard";

const TransactionsPage = () => {
  // Sample data
  const [buildings, setBuildings] = useState([
    { id: 1, name: "Al Faisaliah Residences" },
    { id: 2, name: "Kingdom Tower Apartments" },
    { id: 3, name: "Red Sea Residence" },
  ]);

  const [apartments, setApartments] = useState([
    { id: 101, number: "A-101", buildingId: 1 },
    { id: 102, number: "A-102", buildingId: 1 },
    { id: 103, number: "A-201", buildingId: 1 },
    { id: 201, number: "B-101", buildingId: 2 },
    { id: 202, number: "B-102", buildingId: 2 },
    { id: 301, number: "C-101", buildingId: 3 },
  ]);

  const [tenants, setTenants] = useState([
    { id: 1, name: "Mohammed Al-Saud", apartmentId: 101 },
    { id: 2, name: "Sarah Al-Qahtani", apartmentId: 102 },
    { id: 3, name: "Ahmed Al-Ghamdi", apartmentId: 201 },
    { id: 4, name: "Fatima Al-Otaibi", apartmentId: 301 },
  ]);

  // Sample transaction data
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "2023-04-01",
      buildingId: "1",
      building: "Al Faisaliah Residences",
      apartmentId: "101",
      apartment: "A-101",
      tenantId: "1",
      tenant: "Mohammed Al-Saud",
      type: "Rent Payment",
      amount: "SAR 12,500.00",
      paymentMethod: "Bank Transfer",
      status: "Completed",
      notes: "Monthly rent for April 2023",
    },
    {
      id: 2,
      date: "2023-04-05",
      buildingId: "1",
      building: "Al Faisaliah Residences",
      apartmentId: "102",
      apartment: "A-102",
      tenantId: "2",
      tenant: "Sarah Al-Qahtani",
      type: "Security Deposit",
      amount: "SAR 15,000.00",
      paymentMethod: "Credit Card",
      status: "Completed",
      notes: "Refundable security deposit",
    },
    {
      id: 3,
      date: "2023-04-10",
      buildingId: "2",
      building: "Kingdom Tower Apartments",
      apartmentId: "201",
      apartment: "B-101",
      tenantId: "3",
      tenant: "Ahmed Al-Ghamdi",
      type: "Maintenance Fee",
      amount: "SAR 500.00",
      paymentMethod: "Cash",
      status: "Pending",
      notes: "Plumbing repair",
    },
    {
      id: 4,
      date: "2023-04-15",
      buildingId: "3",
      building: "Red Sea Residence",
      apartmentId: "301",
      apartment: "C-101",
      tenantId: "4",
      tenant: "Fatima Al-Otaibi",
      type: "Rent Payment",
      amount: "SAR 9,800.00",
      paymentMethod: "Bank Transfer",
      status: "Completed",
      notes: "Monthly rent for April 2023",
    },
    {
      id: 5,
      date: "2023-04-20",
      buildingId: "2",
      building: "Kingdom Tower Apartments",
      apartmentId: "201",
      apartment: "B-101",
      tenantId: "3",
      tenant: "Ahmed Al-Ghamdi",
      type: "Utility Payment",
      amount: "SAR 750.00",
      paymentMethod: "Credit Card",
      status: "Completed",
      notes: "Electricity and water bill",
    },
    {
      id: 6,
      date: "2023-04-25",
      buildingId: "1",
      building: "Al Faisaliah Residences",
      apartmentId: "101",
      apartment: "A-101",
      tenantId: "1",
      tenant: "Mohammed Al-Saud",
      type: "Late Fee",
      amount: "SAR 250.00",
      paymentMethod: "Cash",
      status: "Pending",
      notes: "Late payment fee for April rent",
    },
  ]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    building: "",
    apartment: "",
    tenant: "",
    type: "",
    status: "",
    dateRange: { from: "", to: "" },
    amountRange: { min: "", max: "" },
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    transactionId: null,
    transactionDescription: '',
    loading: false
  });

  // Transaction types
  const transactionTypes = [
    "Rent Payment",
    "Security Deposit",
    "Maintenance Fee",
    "Utility Payment",
    "Late Fee",
    "Refund",
  ];

  // Apply filters to transactions
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by building
    if (activeFilters.building) {
      filtered = filtered.filter(
        (t) => t.buildingId === activeFilters.building
      );
    }

    // Filter by apartment
    if (activeFilters.apartment) {
      filtered = filtered.filter(
        (t) => t.apartmentId === activeFilters.apartment
      );
    }

    // Filter by tenant
    if (activeFilters.tenant) {
      filtered = filtered.filter((t) => t.tenantId === activeFilters.tenant);
    }

    // Filter by transaction type
    if (activeFilters.type) {
      filtered = filtered.filter((t) => t.type === activeFilters.type);
    }

    // Filter by status
    if (activeFilters.status) {
      filtered = filtered.filter((t) => t.status === activeFilters.status);
    }

    // Filter by date range
    if (activeFilters.dateRange.from) {
      filtered = filtered.filter(
        (t) => new Date(t.date) >= new Date(activeFilters.dateRange.from)
      );
    }
    if (activeFilters.dateRange.to) {
      filtered = filtered.filter(
        (t) => new Date(t.date) <= new Date(activeFilters.dateRange.to)
      );
    }

    // Filter by amount range
    if (activeFilters.amountRange.min) {
      filtered = filtered.filter((t) => {
        const amount = parseFloat(t.amount.replace(/[^0-9.]/g, ""));
        return amount >= parseFloat(activeFilters.amountRange.min);
      });
    }
    if (activeFilters.amountRange.max) {
      filtered = filtered.filter((t) => {
        const amount = parseFloat(t.amount.replace(/[^0-9.]/g, ""));
        return amount <= parseFloat(activeFilters.amountRange.max);
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, activeFilters]);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id) => {
    const transaction = transactions.find(t => t.id === id);
    const description = transaction ? `${transaction.type} - ${transaction.amount} SAR` : '';

    setDeleteModal({
      isOpen: true,
      transactionId: id,
      transactionDescription: description,
      loading: false
    });
  };

  const confirmDeleteTransaction = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransactions(
        transactions.filter((transaction) => transaction.id !== deleteModal.transactionId)
      );

      notificationService.success('Transaction deleted successfully');
      setDeleteModal({ isOpen: false, transactionId: null, transactionDescription: '', loading: false });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      notificationService.error('An error occurred while deleting the transaction');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteTransaction = () => {
    setDeleteModal({ isOpen: false, transactionId: null, transactionDescription: '', loading: false });
  };

  // Handle save transaction
  const handleSaveTransaction = (transaction) => {
    if (currentTransaction) {
      // Update existing transaction
      setTransactions(
        transactions.map((t) => (t.id === transaction.id ? transaction : t))
      );
      notificationService.success('Transaction updated successfully');
    } else {
      // Add new transaction
      setTransactions([...transactions, transaction]);
      notificationService.success('Transaction created successfully');
    }

    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  return (
    <div className=" mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Financial Transactions
        </h1>
        <PermissionButton
          resource="financial_transactions"
          action="create"
          onClick={() => {
            setCurrentTransaction(null);
            setIsModalOpen(true);
          }}
          className="bg-teal-600 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200 flex items-center"
          tooltipText="You don't have permission to create financial transactions"
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
          Add New Transaction
        </PermissionButton>
      </div>

      {/* Filters */}
      <TransactionFilters
        onFilterChange={handleFilterChange}
        buildings={buildings}
        apartments={apartments}
        tenants={tenants}
        transactionTypes={transactionTypes}
      />

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <TransactionSummary
          transactions={filteredTransactions}
          filters={activeFilters}
        />
      )}

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
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
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        itemName={deleteModal.transactionDescription}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default TransactionsPage;
