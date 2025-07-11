import React, { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Reusable Modal component with consistent styling and accessibility features
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  overlayClassName = "",
  ...props
}) => {
  // Handle escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic width classes based on custom breakpoints and size prop
  const getResponsiveWidthClasses = (size) => {
    const sizeConfigs = {
      sm: {
        base: "w-11/12 max-w-sm",
        "300_to_768": "300_to_768:w-11/12 300_to_768:max-w-sm",
        "768_to_1024": "768_to_1024:w-10/12 768_to_1024:max-w-md",
        "1024_to_1280": "1024_to_1280:w-8/12 1024_to_1280:max-w-lg",
        "1280_to_1340": "1280_to_1340:w-6/12 1280_to_1340:max-w-xl",
        "1340_to_1540": "1340_to_1540:w-5/12 1340_to_1540:max-w-2xl",
        "1540px_to_1640": "1540px_to_1640:w-4/12 1540px_to_1640:max-w-3xl",
      },
      default: {
        base: "w-11/12 max-w-7xl",
        "300_to_768": "300_to_768:w-11/12 300_to_768:max-w-lg",
        "768_to_1024": "768_to_1024:w-10/12 768_to_1024:max-w-xl",
        "1024_to_1280": "1024_to_1280:w-8/12 1024_to_1280:max-w-2xl",
        "1280_to_1340": "1280_to_1340:w-7/12 1280_to_1340:max-w-3xl",
        "1340_to_1540": "1340_to_1540:w-6/12 1340_to_1540:max-w-4xl",
        "1540px_to_1640": "1540px_to_1640:w-5/12 1540px_to_1640:max-w-5xl",
      },
      lg: {
        base: "w-11/12 max-w-xl",
        "300_to_768": "300_to_768:w-11/12 300_to_768:max-w-xl",
        "768_to_1024": "768_to_1024:w-10/12 768_to_1024:max-w-2xl",
        "1024_to_1280": "1024_to_1280:w-9/12 1024_to_1280:max-w-4xl",
        "1280_to_1340": "1280_to_1340:w-8/12 1280_to_1340:max-w-5xl",
        "1340_to_1540": "1340_to_1540:w-7/12 1340_to_1540:max-w-6xl",
        "1540px_to_1640": "1540px_to_1640:w-6/12 1540px_to_1640:max-w-7xl",
      },
      xl: {
        base: "w-11/12 max-w-2xl",
        "300_to_768": "300_to_768:w-11/12 300_to_768:max-w-2xl",
        "768_to_1024": "768_to_1024:w-10/12 768_to_1024:max-w-3xl",
        "1024_to_1280": "1024_to_1280:w-9/12 1024_to_1280:max-w-5xl",
        "1280_to_1340": "1280_to_1340:w-8/12 1280_to_1340:max-w-6xl",
        "1340_to_1540": "1340_to_1540:w-8/12 1340_to_1540:max-w-7xl",
        "1540px_to_1640": "1540px_to_1640:w-7/12 1540px_to_1640:min-w-[1200px]",
      },
      full: {
        base: "w-11/12",
        "300_to_768": "300_to_768:w-11/12",
        "768_to_1024": "768_to_1024:w-10/12",
        "1024_to_1280": "1024_to_1280:w-11/12",
        "1280_to_1340": "1280_to_1340:w-10/12",
        "1340_to_1540": "1340_to_1540:w-11/12",
        "1540px_to_1640": "1540px_to_1640:w-10/12",
      },
    };

    const config = sizeConfigs[size] || sizeConfigs.default;
    return Object.values(config).join(" ");
  };

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="absolute top-0 left-0">
      <div
        className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 ${overlayClassName}`}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div
          className={`bg-white rounded-xl shadow-2xl ${getResponsiveWidthClasses(
            size
          )} max-h-[90vh] overflow-hidden animate-slide-up ${className}`}
          {...props}
        >
          {/* Modal Header */}
          {(title || showCloseButton) && (
            <div
              className={`bg-gradient-to-r from-slate-900 to-teal-800 text-white px-6 py-4 ${headerClassName}`}
            >
              <div className="flex justify-between items-center">
                {title && (
                  <div>
                    <h2 id="modal-title" className="text-xl font-bold">
                      {title}
                    </h2>
                  </div>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-white hover:text-teal-200 transition-colors duration-200 p-1 rounded-md hover:bg-teal-800"
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Modal Body */}
          <div
            className={`overflow-y-auto max-h-[calc(90vh-80px)] ${bodyClassName}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "default", "lg", "xl", "full"]),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  overlayClassName: PropTypes.string,
};

export default Modal;
