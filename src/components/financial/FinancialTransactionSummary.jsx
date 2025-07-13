const FinancialTransactionSummary = ({ statistics, filters }) => {
  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getFilterDescription = () => {
    if (!filters || Object.keys(filters).length === 0) {
      return "All Transactions";
    }

    const filterParts = [];
    
    if (filters.transactionType) {
      filterParts.push(filters.transactionType);
    }
    
    if (filters.status) {
      filterParts.push(`Status: ${filters.status}`);
    }
    
    if (filters.dateFrom || filters.dateTo) {
      if (filters.dateFrom && filters.dateTo) {
        filterParts.push(`${new Date(filters.dateFrom).toLocaleDateString()} - ${new Date(filters.dateTo).toLocaleDateString()}`);
      } else if (filters.dateFrom) {
        filterParts.push(`From ${new Date(filters.dateFrom).toLocaleDateString()}`);
      } else {
        filterParts.push(`Until ${new Date(filters.dateTo).toLocaleDateString()}`);
      }
    }

    return filterParts.length > 0 ? filterParts.join(', ') : "Filtered Results";
  };

  const getCompletionRate = () => {
    if (!statistics.totalTransactions || statistics.totalTransactions === 0) return 0;
    return Math.round((statistics.completedTransactions / statistics.totalTransactions) * 100);
  };

  const getStatusDistribution = () => {
    const total = statistics.totalTransactions || 0;
    if (total === 0) return [];

    return [
      {
        label: 'Completed',
        count: statistics.completedTransactions || 0,
        percentage: Math.round(((statistics.completedTransactions || 0) / total) * 100),
        color: 'bg-green-500'
      },
      {
        label: 'Pending',
        count: statistics.pendingTransactions || 0,
        percentage: Math.round(((statistics.pendingTransactions || 0) / total) * 100),
        color: 'bg-yellow-500'
      },
      {
        label: 'Failed',
        count: statistics.failedTransactions || 0,
        percentage: Math.round(((statistics.failedTransactions || 0) / total) * 100),
        color: 'bg-red-500'
      }
    ];
  };

  const getTopTransactionTypes = () => {
    if (!statistics.transactionsByType) return [];
    
    return Object.entries(statistics.transactionsByType)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 3)
      .map(([type, data]) => ({
        type,
        count: data.count,
        amount: data.amount
      }));
  };

  const getTopPaymentMethods = () => {
    if (!statistics.transactionsByMethod) return [];
    
    return Object.entries(statistics.transactionsByMethod)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 3)
      .map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount
      }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-sm text-gray-600 mt-1">{getFilterDescription()}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-600">
            {formatCurrency(statistics.totalAmount)}
          </div>
          <div className="text-sm text-gray-500">Total Transaction Value</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-900">{statistics.totalTransactions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{statistics.completedTransactions || 0}</p>
              <p className="text-xs text-green-600">{getCompletionRate()}% completion rate</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{statistics.pendingTransactions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Fees</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency((statistics.totalProcessingFees || 0) + (statistics.totalLateFees || 0))}
              </p>
              <p className="text-xs text-purple-600">
                Processing: {formatCurrency(statistics.totalProcessingFees)} | Late: {formatCurrency(statistics.totalLateFees)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>
          <div className="space-y-3">
            {getStatusDistribution().map((status) => (
              <div key={status.label} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{status.label}</span>
                    <span className="text-sm text-gray-500">{status.count} ({status.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Transaction Types</h3>
          <div className="space-y-3">
            {getTopTransactionTypes().map((type, index) => (
              <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{type.type}</p>
                    <p className="text-xs text-gray-500">{type.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(type.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {getTopPaymentMethods().length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getTopPaymentMethods().map((method) => (
              <div key={method.method} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{method.method}</p>
                  <p className="text-lg font-bold text-teal-600 mt-1">{formatCurrency(method.amount)}</p>
                  <p className="text-xs text-gray-500">{method.count} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTransactionSummary;
