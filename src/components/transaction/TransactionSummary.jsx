import React, { useMemo } from 'react';

const TransactionSummary = ({ transactions, filters }) => {
  // Calculate summary statistics
  const summary = useMemo(() => {
    // Extract numeric values from amount strings
    const amounts = transactions.map(t => {
      const numericValue = t.amount.replace(/[^0-9.]/g, '');
      return parseFloat(numericValue);
    });
    
    // Calculate total amount
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // Count by status
    const statusCounts = {
      Completed: transactions.filter(t => t.status === 'Completed').length,
      Pending: transactions.filter(t => t.status === 'Pending').length,
      Failed: transactions.filter(t => t.status === 'Failed').length
    };
    
    // Count by type
    const typeCounts = {};
    transactions.forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });
    
    // Calculate total by type
    const totalsByType = {};
    transactions.forEach(t => {
      const numericValue = parseFloat(t.amount.replace(/[^0-9.]/g, ''));
      totalsByType[t.type] = (totalsByType[t.type] || 0) + numericValue;
    });
    
    return {
      total,
      count: transactions.length,
      statusCounts,
      typeCounts,
      totalsByType
    };
  }, [transactions]);

  // Format currency
  const formatCurrency = (amount) => {
    return `SAR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get title based on active filters
  const getTitle = () => {
    if (filters.tenant) {
      return 'Tenant Transaction Summary';
    } else if (filters.apartment) {
      return 'Apartment Transaction Summary';
    } else if (filters.building) {
      return 'Building Transaction Summary';
    }
    return 'Overall Transaction Summary';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{getTitle()}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Amount */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-blue-800">{formatCurrency(summary.total)}</p>
        </div>
        
        {/* Transaction Count */}
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-green-800">{summary.count}</p>
        </div>
        
        {/* Status Breakdown */}
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Status Breakdown</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-sm">Completed: {summary.statusCounts.Completed}</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
              <span className="text-sm">Pending: {summary.statusCounts.Pending}</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span className="text-sm">Failed: {summary.statusCounts.Failed}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Types Breakdown */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Transaction Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(summary.totalsByType).map(([type, amount]) => (
            <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{type}</p>
                <p className="text-sm text-gray-500">{summary.typeCounts[type]} transactions</p>
              </div>
              <p className="font-bold text-blue-600">{formatCurrency(amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
