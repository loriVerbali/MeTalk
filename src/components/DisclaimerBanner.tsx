import React from "react";

const DisclaimerBanner: React.FC = () => {
  return (
    <div
      className="disclaimer-banner"
      style={{
        backgroundColor: "#E8F4FD",
        border: "2px solid #3498DB",
        padding: "12px 20px",
        margin: "0",
        textAlign: "center",
        fontSize: "14px",
        color: "#2C3E50",
        fontWeight: "500",
      }}
    >
      <div style={{ marginBottom: "4px" }}>
        <strong>Demo Version</strong> — No personal data is stored or saved
      </div>
      <div style={{ fontSize: "12px", opacity: 0.8 }}>
        This is not a medical device. For educational and demonstration purposes
        only.
      </div>
    </div>
  );
};

export default DisclaimerBanner;
