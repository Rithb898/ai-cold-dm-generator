import { generateText } from "ai"
import { createGroq } from '@ai-sdk/groq';
import type { GeneratedMessage, Platform, ReasonType } from "@/type";

const groq = createGroq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY
});

// type Platform = "linkedin" | "twitter"
// type ReasonType = "referral" | "learn_more" | "enthusiasm" | "follow_up"

// interface FormData {
//   userName: string
//   userRole: string
//   targetName: string
//   targetRole: string
//   companyName: string
//   jobTitle: string
//   reason: ReasonType
//   specificMention: string
//   mentionResume: boolean
// }

// interface GeneratedMessage {
//   text: string
//   variant: "standard" | "concise" | "enthusiastic"
// }

function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }

  // If no code blocks, try to find JSON array directly
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    return arrayMatch[0]
  }

  return text.trim()
}

export async function generateMessages(platform: Platform, formData: FormData): Promise<GeneratedMessage[]> {
  const reasonMap: Record<ReasonType, string> = {
    referral: "requesting a referral for the position",
    learn_more: "learning more about the team and role",
    enthusiasm: "expressing enthusiasm for the position",
    follow_up: "following up on my application",
  }

  const reasonText = reasonMap[formData.reason] || formData.reason

  const characterLimit = platform === "twitter" ? 280 : 1000

  const systemPrompt = `You are an expert in writing effective job application follow-up messages for ${platform}.

Generate exactly 3 personalized messages from ${formData.userName} (${formData.userRole}) to ${formData.targetName} (${formData.targetRole} at ${formData.companyName}).

Context:
- The sender (${formData.userName}) has already applied for the ${formData.jobTitle} position at ${formData.companyName}
- The purpose is ${reasonText}
- Additional context: ${formData.specificMention || "None provided"}
${formData.mentionResume ? "- The sender wants to mention they've attached their resume to this message" : ""}

Requirements:
- Each message must be under ${characterLimit} characters
- Professional but friendly tone
- Include a clear call-to-action (asking for a referral, brief chat, etc.)
- Mention the specific job title applied for
${formData.mentionResume ? "- Include a brief mention of the attached resume" : ""}
- Sound natural and personalized, not generic
- Each message should have a slightly different approach

Return ONLY a valid JSON array with exactly this structure:
[
  {"variant": "standard", "text": "your standard message here"},
  {"variant": "concise", "text": "your concise message here"},
  {"variant": "enthusiastic", "text": "your enthusiastic message here"}
]

Do not include any markdown formatting, explanations, or additional text.`

  try {
    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: systemPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    console.log("Raw AI response:", response.text)

    // Extract JSON from potential markdown formatting
    const cleanedResponse = extractJsonFromMarkdown(response.text)
    console.log("Cleaned response:", cleanedResponse)

    // Parse the JSON response
    const messages: GeneratedMessage[] = JSON.parse(cleanedResponse)

    // Validate the response structure
    if (!Array.isArray(messages) || messages.length !== 3) {
      throw new Error("Invalid response structure: expected array of 3 messages")
    }

    // Validate each message has required properties
    for (const message of messages) {
      if (!message.variant || !message.text) {
        throw new Error("Invalid message structure: missing variant or text")
      }
      if (!["standard", "concise", "enthusiastic"].includes(message.variant)) {
        message.variant = "standard" // Fix invalid variants
      }
    }

    return messages
  } catch (error) {
    console.error("Error generating messages:", error)

    // Fallback: return default messages if AI fails
    const fallbackMessages: GeneratedMessage[] = [
      {
        variant: "standard",
        text: `Hi ${formData.targetName}, I'm ${formData.userName}, a ${formData.userRole}. I recently applied for the ${formData.jobTitle} position at ${formData.companyName} and I'm reaching out because I'm very interested in the role. ${formData.mentionResume ? "I've attached my resume for your reference. " : ""}Would you be open to a brief conversation about the position or potentially providing a referral? Thank you for your time.`,
      },
      {
        variant: "concise",
        text: `Hello ${formData.targetName}, I applied for the ${formData.jobTitle} role at ${formData.companyName}. ${formData.mentionResume ? "I've attached my resume for your review. " : ""}I'd love to learn more about the team. Could we chat briefly?`,
      },
      {
        variant: "enthusiastic",
        text: `Hi ${formData.targetName}! I'm ${formData.userName} and I'm really excited about the ${formData.jobTitle} position at ${formData.companyName}. I've already submitted my application ${formData.mentionResume ? "and attached my resume to this message " : ""}and would love the opportunity to discuss how my experience as a ${formData.userRole} aligns with what you're looking for. Would you be willing to chat?`,
      },
    ]

    return fallbackMessages
  }
}
