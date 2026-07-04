import { Router, Request, Response } from "express";
import { validateSubmitBody, SubmitBody } from "../validators";
import { hashAadhaar, generateReferenceNumber } from "../utils";
import prisma from "../lib/prisma";

const router = Router();

/**
 * POST /api/submit
 * Validates and saves a Udyam registration submission.
 * Returns 201 with a generated reference number on success,
 * or 400 with an errors object on validation failure.
 */
router.post("/submit", async (req: Request, res: Response) => {
  const body = req.body as Partial<SubmitBody>;

  // Server-side validation
  const errors = validateSubmitBody(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // Safe cast — validation guarantees all required fields are present
  const data = body as SubmitBody;

  try {
    // Generate a unique reference number (retry once on collision)
    let referenceNumber = generateReferenceNumber();
    const existing = await prisma.udyamSubmission.findUnique({
      where: { referenceNumber },
    });
    if (existing) {
      referenceNumber = generateReferenceNumber();
    }

    await prisma.udyamSubmission.create({
      data: {
        referenceNumber,
        aadhaarHash: hashAadhaar(data.aadhaarNumber),
        applicantName: data.applicantName.trim(),
        organisationType: data.organisationType,
        panNumber: data.panNumber.toUpperCase(),
        panHolderName: data.panHolderName?.trim() ?? "",
        dobOrDoi: new Date(data.dobOrDoi),
        otpVerified: true, // OTP was completed on the frontend before reaching step 2
        panVerified: false,
      },
    });

    return res.status(201).json({ referenceNumber });
  } catch (err) {
    console.error("[POST /api/submit] DB error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
});

/**
 * GET /api/submissions/:referenceNumber
 * Looks up a submission by its reference number.
 * Returns 200 with the record, or 404 if not found.
 */
router.get(
  "/submissions/:referenceNumber",
  async (req: Request, res: Response) => {
    const { referenceNumber } = req.params;

    try {
      const submission = await prisma.udyamSubmission.findUnique({
        where: { referenceNumber: referenceNumber as string },
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
          // aadhaarHash intentionally excluded from response
        },
      });

      if (!submission) {
        return res.status(404).json({
          message: `No submission found for reference number: ${referenceNumber}`,
        });
      }

      return res.status(200).json(submission);
    } catch (err) {
      console.error("[GET /api/submissions] DB error:", err);
      return res
        .status(500)
        .json({ message: "Internal server error. Please try again." });
    }
  }
);

export default router;
