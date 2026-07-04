import request from "supertest";
import app from "../index";
import prisma from "../lib/prisma";

// Mock the Prisma Client singleton instance
jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    udyamSubmission: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("Udyam Registration API - Backend Tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/submit", () => {
    
    const validPayload = {
      aadhaarNumber: "123456789012",
      applicantName: "Akshita Sharma",
      organisationType: "private_ltd",
      panNumber: "ABCDE1234F",
      panHolderName: "Akshita Sharma Ltd",
      dobOrDoi: "2020-01-15",
    };

    it("should successfully submit and return 201 + reference number on valid data", async () => {
      // Mock findUnique to return null (no collision)
      (prisma.udyamSubmission.findUnique as jest.Mock).mockResolvedValue(null);
      // Mock create to succeed
      (prisma.udyamSubmission.create as jest.Mock).mockResolvedValue({
        id: "mock-uuid",
        referenceNumber: "UDYAM-MH-00-1234567",
      });

      const res = await request(app)
        .post("/api/submit")
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("referenceNumber");
      expect(res.body.referenceNumber).toMatch(/^UDYAM-[A-Z]{2}-00-[0-9]{7}$/);
      expect(prisma.udyamSubmission.create).toHaveBeenCalledTimes(1);
    });

    it("should return 400 bad request if Aadhaar number is invalid", async () => {
      const badAadhaarPayload = {
        ...validPayload,
        aadhaarNumber: "12345a789012", // contains 'a'
      };

      const res = await request(app)
        .post("/api/submit")
        .send(badAadhaarPayload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("aadhaarNumber");
      expect(prisma.udyamSubmission.create).not.toHaveBeenCalled();
    });

    it("should return 400 bad request if PAN number is invalid", async () => {
      const badPanPayload = {
        ...validPayload,
        panNumber: "ABCD1234F", // 9 characters only
      };

      const res = await request(app)
        .post("/api/submit")
        .send(badPanPayload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("panNumber");
      expect(prisma.udyamSubmission.create).not.toHaveBeenCalled();
    });

    it("should return 400 bad request if mandatory fields are missing", async () => {
      const incompletePayload = {
        aadhaarNumber: "123456789012",
        // applicantName missing
        organisationType: "private_ltd",
        panNumber: "ABCDE1234F",
        // dobOrDoi missing
      };

      const res = await request(app)
        .post("/api/submit")
        .send(incompletePayload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toHaveProperty("applicantName");
      expect(res.body.errors).toHaveProperty("dobOrDoi");
      expect(prisma.udyamSubmission.create).not.toHaveBeenCalled();
    });

  });

  describe("GET /api/submissions/:referenceNumber", () => {
    
    it("should return 200 and the submission data if reference number exists", async () => {
      const mockDbSubmission = {
        referenceNumber: "UDYAM-MH-00-1234567",
        applicantName: "Akshita Sharma",
        organisationType: "private_ltd",
        panNumber: "ABCDE1234F",
        panHolderName: "Akshita Sharma Ltd",
        dobOrDoi: new Date("2020-01-15"),
        otpVerified: true,
        panVerified: false,
        createdAt: new Date(),
      };

      (prisma.udyamSubmission.findUnique as jest.Mock).mockResolvedValue(mockDbSubmission);

      const res = await request(app)
        .get("/api/submissions/UDYAM-MH-00-1234567");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockDbSubmission,
        dobOrDoi: mockDbSubmission.dobOrDoi.toISOString(),
        createdAt: mockDbSubmission.createdAt.toISOString(),
      });
      expect(prisma.udyamSubmission.findUnique).toHaveBeenCalledWith({
        where: { referenceNumber: "UDYAM-MH-00-1234567" },
        select: {
          referenceNumber: true,
          applicantName: true,
          organisationType: true,
          panNumber: true,
          panHolderName: true,
          dobOrDoi: true,
          otpVerified: true,
          panVerified: true,
          createdAt: true,
        },
      });
    });

    it("should return 404 not found if reference number does not exist", async () => {
      (prisma.udyamSubmission.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/submissions/UDYAM-UNKNOWN-123");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toContain("No submission found");
    });

  });

});
