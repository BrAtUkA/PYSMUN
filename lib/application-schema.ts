import { z } from "zod";
import { cnicPattern } from "./cnic";
import { normalizePakistaniMobile, pakistaniMobileMessage } from "./contact-validation";

const pakistaniMobile = z.string().trim().max(22).transform((value, ctx) => {
  const normalized = normalizePakistaniMobile(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: pakistaniMobileMessage });
    return z.NEVER;
  }
  return normalized;
});

const optionalPakistaniMobile = z.string().trim().max(22).transform((value, ctx) => {
  if (!value) return "";
  const normalized = normalizePakistaniMobile(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: pakistaniMobileMessage });
    return z.NEVER;
  }
  return normalized;
});

export const trainingCampApplicationSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name").max(100),
  cnic: z.string().trim().regex(cnicPattern, "Enter a valid CNIC in 12345-1234567-1 format"),
  email: z.email("Enter a valid email address").max(160).transform((value) => value.toLowerCase()),
  whatsapp: pakistaniMobile,
  alternatePhone: optionalPakistaniMobile,
  age: z.coerce.number().int().min(15, "Applicants must be between 15 and 23").max(23, "Applicants must be between 15 and 23"),
  city: z.string().trim().min(2, "Enter your city").max(80),
  institution: z.string().trim().min(2, "Enter your institution").max(160),
  educationLevel: z.enum(["school", "college", "university", "other"]),
  experience: z.enum(["none", "one-two", "three-plus"]),
  motivation: z.string().trim().min(30, "Tell us a little more (at least 30 characters)").max(700),
  requirements: z.string().trim().max(500),
  referral: z.string().trim().max(100),
  transactionReference: z.string().trim().min(4, "Enter the transaction ID from your payment").max(80),
  consent: z.literal(true, { error: "Consent is required to submit" }),
  website: z.string().max(0, "Submission rejected"),
  turnstileToken: z.string().optional(),
});

export type TrainingCampApplication = z.infer<typeof trainingCampApplicationSchema>;

export const campusAmbassadorApplicationSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name").max(100),
  cnic: z.string().trim().regex(cnicPattern, "Enter a valid CNIC in 12345-1234567-1 format"),
  email: z.email("Enter a valid email address").max(160).transform((value) => value.toLowerCase()),
  whatsapp: pakistaniMobile,
  age: z.coerce.number().int().min(15, "Applicants must be between 15 and 23").max(23, "Applicants must be between 15 and 23"),
  city: z.string().trim().min(2, "Enter your city").max(80),
  institution: z.string().trim().min(2, "Enter your institution").max(160),
  educationLevel: z.enum(["school", "college", "university", "other"]),
  campusRole: z.enum(["student", "society-member", "society-lead", "other"]),
  experience: z.enum(["none", "some", "extensive"]),
  motivation: z.string().trim().min(40, "Tell us a little more (at least 40 characters)").max(700),
  outreachPlan: z.string().trim().min(40, "Share a brief plan (at least 40 characters)").max(900),
  socialProfile: z.string().trim().max(200),
  consent: z.literal(true, { error: "Consent is required to submit" }),
  website: z.string().max(0, "Submission rejected"),
  turnstileToken: z.string().optional(),
});

export type CampusAmbassadorApplication = z.infer<typeof campusAmbassadorApplicationSchema>;

export const directorateApplicationSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name").max(100),
  cnic: z.string().trim().regex(cnicPattern, "Enter a valid CNIC in 12345-1234567-1 format"),
  email: z.email("Enter a valid email address").max(160).transform((value) => value.toLowerCase()),
  whatsapp: pakistaniMobile,
  emergencyContact: pakistaniMobile,
  institution: z.string().trim().min(2, "Enter your institution").max(160),
  gradeSemester: z.string().trim().min(1, "Enter your grade or semester").max(60),
  preferredDepartment: z.enum(["registrations", "logistics", "hospitality", "media", "decor", "security", "delegate-affairs"]),
  preferredPosition: z.enum(["director", "assistant-director", "staff"]),
  previousExperience: z.string().trim().min(3, "Let us know, even if it's none").max(700),
  uniqueValue: z.string().trim().min(30, "Tell us a little more (at least 30 characters)").max(700),
  instagramLink: z.string().trim().max(200),
  availabilityCity: z.literal("yes", { error: "You must confirm you'll be available in Rahim Yar Khan during the event to apply for this role" }),
  availabilityMeetings: z.literal("yes", { error: "You must confirm you can attend all meetings scheduled before the event to apply for this role" }),
  consent: z.literal(true, { error: "Consent is required to submit" }),
  website: z.string().max(0, "Submission rejected"),
  turnstileToken: z.string().optional(),
});

export type DirectorateApplication = z.infer<typeof directorateApplicationSchema>;
