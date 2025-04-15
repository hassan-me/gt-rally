import {
    AlertCircle,
    CheckCircle,
  } from "lucide-react";

export default  Toast = ({ message, type, onClose }) => {
  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1090 }}
    >
      <div
        className={`toast show ${
          type === "success" ? "bg-success text-white" : "bg-danger text-white"
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header">
          {type === "success" ? (
            <CheckCircle className="me-2" size={16} />
          ) : (
            <AlertCircle className="me-2" size={16} />
          )}
          <strong className="me-auto">
            {type === "success" ? "Success" : "Error"}
          </strong>
          <button
            type="button"
            className="btn-close ms-2 mb-1"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
};
