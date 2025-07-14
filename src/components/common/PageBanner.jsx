import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PageBanner = ({ 
  title, 
  subtitle, 
  icon, 
  stats = [], 
  actions = [], 
  gradient = "from-slate-900 via-slate-800 to-slate-900",
  showUserInfo = true 
}) => {
  const { user } = useAuth();

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-lg p-6 text-white mb-6 shadow-lg`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {icon && (
              <div className="p-2 bg-white/10 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-slate-300 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* User Info */}
          {showUserInfo && user && (
            <div className="flex items-center space-x-4 mt-3 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-slate-300">Welcome, {user.firstName} {user.lastName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="bg-teal-600 px-2 py-1 rounded text-xs font-medium">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex items-center space-x-6 mt-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {stat.icon && (
                    <div className="text-teal-400">
                      {stat.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold">{stat.value}</div>
                    <div className="text-xs text-slate-300">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center space-x-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  action.variant === 'secondary' 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {action.icon && action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Additional Content */}
      {(stats.length > 0 || actions.length > 0) && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBanner;
