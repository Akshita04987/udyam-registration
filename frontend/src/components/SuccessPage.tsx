"use client";

interface SuccessPageProps {
  referenceNumber: string;
  applicantName: string;
}

export default function SuccessPage({
  referenceNumber,
  applicantName,
}: SuccessPageProps) {
  return (
    <div className="success-wrapper" role="main" aria-live="polite">
      <div className="success-icon-wrap" aria-hidden="true">
        <svg
          className="success-icon"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="40" cy="40" r="40" fill="#1a6e3c" />
          <path
            d="M22 42l12 12 24-26"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="success-heading">Registration Successful!</h2>

      <p className="success-sub">
        Dear <strong>{applicantName}</strong>, your Udyam Registration
        application has been submitted successfully.
      </p>

      <div className="ref-box">
        <p className="ref-label">Your Reference Number</p>
        <p className="ref-number" role="status">
          {referenceNumber}
        </p>
        <p className="ref-note">
          Please save this reference number for future correspondence.
        </p>
      </div>

      <div className="success-info">
        <p>
          You will receive a confirmation on your Aadhaar-registered mobile
          number. Your application will be processed within{" "}
          <strong>3–5 working days</strong>.
        </p>
      </div>

      <button
        id="register-another-btn"
        type="button"
        className="btn btn-outline"
        onClick={() => window.location.reload()}
      >
        Register Another Enterprise
      </button>
    </div>
  );
}
