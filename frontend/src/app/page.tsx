"use client";

import { useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import Step1Form from "@/components/Step1Form";
import Step2Form from "@/components/Step2Form";
import SuccessPage from "@/components/SuccessPage";
import schemaRaw from "@/schema/udyamFormSchema.json";
import { UdyamFormSchema } from "@/types/form";

const schema = schemaRaw as UdyamFormSchema;

type AppStep = 1 | 2 | "success";

interface Step1Data {
  aadhaarNumber: string;
  applicantName: string;
  consent: boolean;
  otp: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = (refNum: string) => {
    setReferenceNumber(refNum);
    setCurrentStep("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepTitle =
    currentStep === "success"
      ? "Registration Complete"
      : schema.steps[Number(currentStep) - 1].title;

  return (
    <div className="page-wrapper">
      {/* Government-style blue header */}
      <header className="gov-header" role="banner">
        <div className="header-inner">
          <div className="header-logo-row">
            <div className="emblem" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="#FFD700" strokeWidth="2" />
                <circle cx="20" cy="20" r="10" fill="#FFD700" fillOpacity="0.3" />
                <path d="M20 8 L22 16 L30 16 L24 21 L26 29 L20 24 L14 29 L16 21 L10 16 L18 16 Z" fill="#FFD700" />
              </svg>
            </div>
            <div className="header-text">
              <span className="header-title">
                Udyam Registration Portal
              </span>
              <span className="header-subtitle">
                Ministry of Micro, Small and Medium Enterprises, Government of India
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content" id="main">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">
              {currentStep !== "success" && (
                <span className="step-badge">
                  Step {currentStep} of 2
                </span>
              )}
              {stepTitle}
            </h1>
          </div>

          {/* Progress bar — only shown during active steps */}
          {currentStep !== "success" && (
            <div className="card-progress">
              <ProgressBar currentStep={currentStep as 1 | 2} />
            </div>
          )}

          <div className="card-body">
            {currentStep === 1 && (
              <Step1Form onNext={handleStep1Next} />
            )}

            {currentStep === 2 && step1Data && (
              <Step2Form
                step1Data={step1Data}
                onSuccess={handleSuccess}
              />
            )}

            {currentStep === "success" && (
              <SuccessPage
                referenceNumber={referenceNumber}
                applicantName={step1Data?.applicantName ?? ""}
              />
            )}
          </div>
        </div>

        {/* Info strip */}
        {currentStep !== "success" && (
          <p className="info-strip">
            <svg className="info-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Fields marked with <strong>*</strong> are mandatory. All data is
            encrypted and transmitted securely.
          </p>
        )}
      </main>

      <footer className="gov-footer" role="contentinfo">
        <p>
          © {new Date().getFullYear()} Ministry of MSME, Government of India.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}
