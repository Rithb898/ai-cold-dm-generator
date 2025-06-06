export type Platform = "linkedin" | "twitter";
export type ReasonType =
  | "job_application"
  | "internship_inquiry"
  | "referral_request"
  | "informational"
  | "follow_up";
export type Tone = "professional" | "friendly" | "enthusiastic" | "humble";
export type JobType = "internship" | "full-time" | "part-time" | "freelance";

export interface FormData {
  yourName: string;
  yourRole: string;
  targetName: string;
  targetRole: string;
  companyName: string;
  jobTitle: string;
  reason: ReasonType;
  personalNote?: string;
  mentionResume: boolean;
  resumeLink?: string;
  tone: Tone;
  platform: Platform;
  jobType: JobType;
}

export interface GeneratedMessage {
  linkedin: {
    concise: string;
    detailed: string;
    follow_up: string;
  };
  twitter: {
    concise: string;
    detailed: string;
    follow_up: string;
  };
}

export interface SavedMessage {
  id: string;
  platform: Platform;
  formData: FormData;
  messages: GeneratedMessage;
  timestamp: number;
}
