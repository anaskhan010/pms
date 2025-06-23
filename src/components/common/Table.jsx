import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

/**
 * Standardized Table component with consistent styling and responsive design
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  variant = 'default',
  size = 'default',
  striped = true,
  hoverable = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    default: '',
    lg: 'text-base'
  };

  const variantClasses = {
    default: 'table-header',
    primary: 'bg-teal-600 text-white',
    secondary: 'bg-gray-600 text-white'
  };

  const tableClasses = [
    'table',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const headerClasses = variantClasses[variant] || variantClasses.default;

  const LoadingRow = () => (
    <tr>
      {columns.map((_, index) => (
        <td key={index} className="table-cell">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );

  const EmptyRow = () => (
    <tr>
      <td colSpan={columns.length} className="table-cell text-center py-8 text-gray-500">
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </td>
    </tr>
  );

  return (
    <Card variant="default" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className={tableClasses} {...props}>
          <thead className={headerClasses}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`table-header-cell ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`table-body ${striped ? 'divide-y divide-gray-200' : ''}`}>
            {loading ? (
              // Show loading rows
              Array.from({ length: 5 }).map((_, index) => (
                <LoadingRow key={index} />
              ))
            ) : data.length === 0 ? (
              <EmptyRow />
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`${hoverable ? 'table-row' : ''} ${
                    striped && rowIndex % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  {columns.map((column, colIndex) => {
                    const cellValue = column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key];

                    return (
                      <td
                        key={column.key || colIndex}
                        className={`${
                          column.secondary ? 'table-cell-secondary' : 'table-cell'
                        } ${column.cellClassName || ''}`}
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      width: PropTypes.string,
      className: PropTypes.string,
      cellClassName: PropTypes.string,
      secondary: PropTypes.bool,
      sortable: PropTypes.bool,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary']),
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  striped: PropTypes.bool,
  hoverable: PropTypes.bool
};

export default Table;
