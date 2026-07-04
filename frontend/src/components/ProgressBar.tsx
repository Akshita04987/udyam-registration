"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: 1 | 2;
}

const STEPS = [
  { number: 1, label: "Aadhaar Verification" },
  { number: 2, label: "PAN Verification" },
];

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="progress-bar-wrapper" role="navigation" aria-label="Form progress">
      <div className="progress-steps">
        {STEPS.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              <div className="progress-step">
                <div
                  className={`step-circle ${
                    isCompleted
                      ? "step-completed"
                      : isActive
                      ? "step-active"
                      : "step-pending"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="check-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={`step-label ${
                    isActive ? "step-label-active" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`step-connector ${
                    isCompleted ? "connector-done" : ""
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
