import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "./index";

/**
 * Reusable Delete Confirmation Modal Component
 * Provides a consistent confirmation dialog for delete operations
 */
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  variant = "danger", // danger, warning
  icon = null,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  // Default delete icon
  const defaultIcon = (
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
      <svg
        className="h-6 w-6 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
  );

  // Warning icon for less destructive actions
  const warningIcon = (
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
      <svg
        className="h-6 w-6 text-yellow-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
  );

  const displayIcon = icon || (variant === "warning" ? warningIcon : defaultIcon);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      {...props}
    >
      <div className="p-6">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 sm:mx-0 sm:h-10 sm:w-10">
            {displayIcon}
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message}
                {itemName && (
                  <span className="font-medium text-gray-700"> "{itemName}"</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className="w-full sm:w-auto sm:ml-3"
          >
            {loading ? "Deleting..." : confirmText}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  itemName: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(["danger", "warning"]),
  icon: PropTypes.node,
};

export default DeleteConfirmationModal;
