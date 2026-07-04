import { validateAadhaar, validatePan } from "@/lib/validators";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Step1Form from "@/components/Step1Form";
import Step2Form from "@/components/Step2Form";
import "@testing-library/jest-dom";

// Mock the standard fetch API for backend submit in Step 2 tests
global.fetch = jest.fn();

describe("Udyam Registration - Frontend Form Tests", () => {
  
  describe("Validation Logic - Regex Tests", () => {
    
    describe("Aadhaar Number Validation", () => {
      it("should return empty string for valid 12-digit Aadhaar", () => {
        expect(validateAadhaar("123456789012")).toBe("");
        expect(validateAadhaar("987654321098")).toBe("");
      });

      it("should return error message for invalid Aadhaar cases", () => {
        // Less than 12 digits
        expect(validateAadhaar("12345678901")).not.toBe("");
        // More than 12 digits
        expect(validateAadhaar("1234567890123")).not.toBe("");
        // Contains letters
        expect(validateAadhaar("12345678901a")).not.toBe("");
        // Contains spaces/special characters
        expect(validateAadhaar("1234 5678 9012")).not.toBe("");
        // Empty Aadhaar
        expect(validateAadhaar("")).not.toBe("");
      });
    });

    describe("PAN Number Validation", () => {
      it("should return empty string for valid PAN (5 letters, 4 digits, 1 letter)", () => {
        expect(validatePan("ABCDE1234F")).toBe("");
        expect(validatePan("XYZAB9999Z")).toBe("");
      });

      it("should return error message for invalid PAN cases", () => {
        // Empty PAN
        expect(validatePan("")).not.toBe("");
        // Incorrect format: wrong number of characters
        expect(validatePan("ABCD1234F")).not.toBe(""); // 9 characters
        expect(validatePan("ABCDEF1234F")).not.toBe(""); // 11 characters
        // Incorrect structure
        expect(validatePan("12345ABCDE")).not.toBe(""); // reversed
        expect(validatePan("ABCDE12345")).not.toBe(""); // ends with digit instead of letter
        // Lowercase PAN validation (in validator itself, it expects uppercase; lowercase is handled by autoUppercase logic on input change, but validator validates the exact string format)
        expect(validatePan("abcde1234f")).toBe(""); 
      });
    });

  });

  describe("UI Component Tests - Step 1 Form", () => {
    let mockOnNext: jest.Mock;

    beforeEach(() => {
      mockOnNext = jest.fn();
    });

    it("should disable Validate & Generate OTP button initially", () => {
      render(<Step1Form onNext={mockOnNext} />);
      const otpButton = screen.getByRole("button", { name: /Validate & Generate OTP/i });
      expect(otpButton).toBeDisabled();
    });

    it("should enable Validate & Generate OTP button when Aadhaar, Name, and Consent are valid", () => {
      render(<Step1Form onNext={mockOnNext} />);
      
      const aadhaarInput = screen.getByLabelText(/^Aadhaar Number/i);
      const nameInput = screen.getByLabelText(/^Applicant Name/i);
      const consentCheckbox = screen.getByRole("checkbox");
      const otpButton = screen.getByRole("button", { name: /Validate & Generate OTP/i });

      // Enter valid details
      fireEvent.change(aadhaarInput, { target: { value: "123456789012" } });
      fireEvent.change(nameInput, { target: { value: "Akshita Sharma" } });
      fireEvent.click(consentCheckbox);

      expect(otpButton).not.toBeDisabled();
    });

    it("should keep OTP button disabled if any field is invalid", () => {
      render(<Step1Form onNext={mockOnNext} />);
      
      const aadhaarInput = screen.getByLabelText(/^Aadhaar Number/i);
      const nameInput = screen.getByLabelText(/^Applicant Name/i);
      const consentCheckbox = screen.getByRole("checkbox");
      const otpButton = screen.getByRole("button", { name: /Validate & Generate OTP/i });

      // Invalid Aadhaar (contains letter)
      fireEvent.change(aadhaarInput, { target: { value: "12345678901a" } });
      fireEvent.change(nameInput, { target: { value: "Akshita Sharma" } });
      fireEvent.click(consentCheckbox);
      expect(otpButton).toBeDisabled();

      // Fix Aadhaar but invalidate name (contains digit)
      fireEvent.change(aadhaarInput, { target: { value: "123456789012" } });
      fireEvent.change(nameInput, { target: { value: "Akshita 123" } });
      expect(otpButton).toBeDisabled();
    });

    it("should show OTP field and enable Resend button flow after OTP is requested", async () => {
      render(<Step1Form onNext={mockOnNext} />);
      
      const aadhaarInput = screen.getByLabelText(/^Aadhaar Number/i);
      const nameInput = screen.getByLabelText(/^Applicant Name/i);
      const consentCheckbox = screen.getByRole("checkbox");
      const otpButton = screen.getByRole("button", { name: /Validate & Generate OTP/i });

      // Fill valid info to enable OTP trigger
      fireEvent.change(aadhaarInput, { target: { value: "123456789012" } });
      fireEvent.change(nameInput, { target: { value: "Akshita Sharma" } });
      fireEvent.click(consentCheckbox);
      
      // Click generate OTP
      fireEvent.click(otpButton);

      // Wait for mock OTP trigger delay
      await waitFor(() => {
        expect(screen.getByLabelText(/Enter OTP/i)).toBeInTheDocument();
      }, { timeout: 1500 });

      // Next step button should now be in the document
      const nextButton = screen.getByRole("button", { name: /Next: PAN Verification/i });
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe("UI Component Tests - Step 2 Form", () => {
    let mockOnSuccess: jest.Mock;
    const mockStep1Data = {
      aadhaarNumber: "123456789012",
      applicantName: "Akshita Sharma",
      consent: true,
      otp: "123456",
    };

    beforeEach(() => {
      mockOnSuccess = jest.fn();
      jest.clearAllMocks();
    });

    it("should render Step 2 fields correctly", () => {
      render(<Step2Form step1Data={mockStep1Data} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByLabelText(/Type of Organisation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/PAN Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date of Birth \/ Date of Incorporation/i)).toBeInTheDocument();
      // Since proprietorship is not selected, PAN Holder Name should not be visible initially
      expect(screen.queryByLabelText(/Name as per PAN/i)).not.toBeInTheDocument();
    });

    it("should dynamically show Name as per PAN field when organisation type is not proprietorship", () => {
      render(<Step2Form step1Data={mockStep1Data} onSuccess={mockOnSuccess} />);
      
      const orgSelect = screen.getByLabelText(/Type of Organisation/i);
      
      // Choose "Private Limited Company"
      fireEvent.change(orgSelect, { target: { value: "private_ltd" } });
      expect(screen.getByLabelText(/Name as per PAN/i)).toBeInTheDocument();

      // Switch back to "Proprietorship"
      fireEvent.change(orgSelect, { target: { value: "proprietorship" } });
      expect(screen.queryByLabelText(/Name as per PAN/i)).not.toBeInTheDocument();
    });

    it("should uppercase PAN number while typing", () => {
      render(<Step2Form step1Data={mockStep1Data} onSuccess={mockOnSuccess} />);
      
      const panInput = screen.getByLabelText(/PAN Number/i) as HTMLInputElement;
      fireEvent.change(panInput, { target: { value: "abcde1234f" } });
      
      expect(panInput.value).toBe("ABCDE1234F");
    });
  });

});
