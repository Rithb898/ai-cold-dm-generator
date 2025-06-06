import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { FormData } from "@/type";

const groq = createGroq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
});

const GeneratedMessageSchema = z.object({
  linkedin: z.object({
    concise: z.string(),
    detailed: z.string(),
    follow_up: z.string(),
  }),
  twitter: z.object({
    concise: z.string(),
    detailed: z.string(),
    follow_up: z.string(),
  }),
});

export async function GenerateDM({ formData }: { formData: FormData }) {
  const systemPrompt = `
You are an expert outreach copywriter specializing in cold DMs for job and internship opportunities. Your goal is to craft high-converting, authentic, and highly personalized direct messages that spark genuine human responses.

Generate exactly 3 unique and compelling message variations that ${
    formData.yourName
  } (${formData.yourRole}) can send to ${formData.targetName} (${
    formData.targetRole
  } at ${formData.companyName}).

## CONTEXT
- The sender has already applied for the "${formData.jobTitle}" position at ${
    formData.companyName
  }.
- The intent of the message is: ${
    formData.reason === "job_application"
      ? "to express excitement and interest in applying for a specific role"
      : formData.reason === "internship_inquiry"
      ? "to seek internship opportunities"
      : formData.reason === "referral_request"
      ? "to request a referral for the position"
      : formData.reason === "informational"
      ? "to learn more about the team and role"
      : "to follow up on a previous application"
  }.
  
- Communication tone: ${formData.tone}.
- Job type: ${formData.jobType}.
- Additional note (if any): ${formData.personalNote || "None provided"}.
${
  formData.mentionResume
    ? `- The sender wants to mention their resume is attached.\n- Resume Link: ${
        formData.resumeLink || "Not provided"
      }`
    : ""
}

## REQUIREMENTS
- Output must target **two platforms**: **LinkedIn** and **Twitter**.
- For each platform, generate three distinct styles:
  - "concise" — a professional and balanced message
  - "detailed" — a short and impactful version
  - "follow_up" — energetic and passionate tone
- Word limits:
  - Twitter: Each message must be ≤ 280 characters
  - LinkedIn: Each message must be ≤ 1000 characters
- Every message must:
  - Mention the specific job title
  - Include a clear call-to-action (e.g., ask for a referral, quick chat, advice, etc.)
  - Sound human, personalized, and relevant — no filler or generic phrases
  - Be different in tone, structure, or CTA from the other two variants
  - Respect the chosen tone (${
    formData.tone
  }) while staying engaging and professional
  ${
    formData.mentionResume
      ? "- Briefly mention the attached resume in each message."
      : ""
  }

## OUTPUT FORMAT
Respond ONLY with a valid JSON object (no explanations, no markdown, no extra text):

{
  "linkedin": {
    "concise": "your concise message here",
    "detailed": "your concise message here",
    "follow_up": "your enthusiastic message here"
  },
  "twitter": {
    "concise": "your concise message here",
    "detailed": "your concise message here",
    "follow_up": "your enthusiastic message here"
  }
}
`.trim();

  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: GeneratedMessageSchema,
      prompt: systemPrompt,
      temperature: 0.7,
    });
    console.log(object);
    return object;
  } catch (error) {
    console.error("Error generating messages:", error);
    console.log("Regenerating...");
    const { object } = await generateObject({
      model: groq("deepseek-r1-distill-llama-70b"),
      schema: GeneratedMessageSchema,
      prompt: systemPrompt,
      temperature: 0.7,
    });
    console.log(object);
    return object;
  }
}
