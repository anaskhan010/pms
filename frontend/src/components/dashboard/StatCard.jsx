import React from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";

const StatCard = ({
  title,
  value,
  icon,
  color,
  link,
  subValue,
  subLabel,
  trend,
  loading = false,
}) => {
  // Color mapping for consistent theming
  const colorMap = {
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200",
      accent: "bg-teal-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      accent: "bg-emerald-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
      accent: "bg-purple-500",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
      accent: "bg-indigo-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      accent: "bg-amber-500",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      accent: "bg-rose-500",
    },
  };

  const colorClasses = colorMap[color] || colorMap.teal;

  // Function to render the appropriate icon
  const renderIcon = () => {
    const iconClasses = `h-6 w-6 ${colorClasses.text}`;

    switch (icon) {
      case "building":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "home":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "users":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "key":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        );
      case "briefcase":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "cash":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "villa":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconClasses}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Function to render trend indicator
  const renderTrend = () => {
    if (!trend) return null;

    const isPositive = trend > 0;
    return (
      <div
        className={`flex items-center text-xs ${
          isPositive ? "text-green-600" : "text-red-600"
        } mt-1`}
      >
        {isPositive ? (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
        <span>
          {Math.abs(trend)}% {isPositive ? "increase" : "decrease"}
        </span>
      </div>
    );
  };

  const CardContent = () => (
    <>
      <div className={`h-1 ${colorClasses.accent} w-full`}></div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2 truncate">
              {loading ? (
                <span className="inline-block h-8 w-24 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                value
              )}
            </p>
            {subValue && !loading && (
              <div className="mt-2">
                <span className="text-sm text-gray-600">{subLabel}: </span>
                <span className="text-sm font-medium text-gray-800">
                  {subValue}
                </span>
              </div>
            )}
            {renderTrend()}
          </div>
          <div
            className={`${colorClasses.bg} ${colorClasses.border} border p-3 rounded-xl ml-4 flex-shrink-0`}
          >
            {loading ? (
              <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
            ) : (
              renderIcon()
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <Card variant="default" loading={loading} className="h-full">
        <CardContent />
      </Card>
    );
  }

  return (
    <Link to={link} className="block h-full">
      <Card
        variant="default"
        interactive={true}
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <CardContent />
      </Card>
    </Link>
  );
};

export default StatCard;
