import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#D4EDDA",
          borderColor: "#C3E6CB",
          color: "#155724",
        };
      case "error":
        return {
          backgroundColor: "#F8D7DA",
          borderColor: "#F5C6CB",
          color: "#721C24",
        };
      case "info":
      default:
        return {
          backgroundColor: "#D1ECF1",
          borderColor: "#BEE5EB",
          color: "#0C5460",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 p-md rounded-lg border-2 shadow-lg animate-fade-in"
      style={getToastStyles()}
    >
      <div className="flex items-center gap-sm">
        <span className="text-lg">{getIcon()}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-sm text-lg hover:opacity-70 focus:outline-none"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
