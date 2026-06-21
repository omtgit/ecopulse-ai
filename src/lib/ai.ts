import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Service abstraction using Google Gemini (free tier).
 * Provides methods for generating sustainability recommendations,
 * behavioral nudges, weekly goals, and local tips.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Free tier, fast responses
});

/** System prompt for the sustainability coach */
const SYSTEM_PROMPT = `You are EcoPulse AI, a friendly and knowledgeable sustainability coach. 
You help users reduce their carbon footprint through practical, actionable advice.
Always be encouraging, specific, and data-driven in your suggestions.
Provide concrete numbers (kg CO2 saved) when possible.
Keep responses concise and formatted as JSON when requested.`;

/**
 * Generate personalized reduction recommendations based on user's carbon data.
 */
export async function generateRecommendations(userProfile: {
  monthlyFootprint: number;
  categoryBreakdown: { category: string; co2Kg: number }[];
  city?: string;
  habits?: string[];
}): Promise<{
  recommendations: {
    suggestion: string;
    category: string;
    estimatedSavingKg: number;
    priority: "high" | "medium" | "low";
    actionType: "reduce" | "replace" | "offset";
  }[];
}> {
  const prompt = `${SYSTEM_PROMPT}

Based on this user's carbon footprint data, generate 5 personalized recommendations:

Monthly footprint: ${userProfile.monthlyFootprint} kg CO2
Category breakdown: ${JSON.stringify(userProfile.categoryBreakdown)}
City: ${userProfile.city || "Unknown"}
Active habits: ${userProfile.habits?.join(", ") || "None yet"}

Respond ONLY with a valid JSON object in this exact format:
{
  "recommendations": [
    {
      "suggestion": "specific actionable tip",
      "category": "TRANSPORT|ELECTRICITY|FOOD|SHOPPING|WASTE",
      "estimatedSavingKg": <number>,
      "priority": "high|medium|low",
      "actionType": "reduce|replace|offset"
    }
  ]
}

Focus on the highest-impact categories first. Be specific with numbers.
Example: "If you replace 2 car rides/week with cycling, you reduce 18kg CO2/month."`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { recommendations: getDefaultRecommendations() };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI recommendation generation failed:", error);
    return { recommendations: getDefaultRecommendations() };
  }
}

/**
 * Generate weekly eco goals for the user.
 */
export async function generateWeeklyGoals(carbonData: {
  weeklyAverage: number;
  topCategory: string;
  currentStreak: number;
}): Promise<string[]> {
  const prompt = `${SYSTEM_PROMPT}

Generate 3 specific weekly eco goals for a user with:
- Weekly average: ${carbonData.weeklyAverage} kg CO2
- Highest category: ${carbonData.topCategory}
- Current habit streak: ${carbonData.currentStreak} days

Respond ONLY with a JSON array of 3 goal strings.
Each goal should be specific, measurable, and achievable in one week.
Example: ["Walk or cycle for commutes at least 3 days this week", ...]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getDefaultGoals();
    return JSON.parse(jsonMatch[0]);
  } catch {
    return getDefaultGoals();
  }
}

/**
 * Generate a contextual behavioral nudge.
 */
export async function generateNudge(context: {
  recentActivity: string;
  timeOfDay: string;
  streak: number;
}): Promise<string> {
  const prompt = `${SYSTEM_PROMPT}

Generate a single short, motivating behavioral nudge (1-2 sentences) for a user.
Context:
- Recent activity: ${context.recentActivity}
- Time of day: ${context.timeOfDay}
- Current streak: ${context.streak} days

Be encouraging and specific. Include an emoji. Respond with just the nudge text, no JSON.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return "🌿 Every small action counts! Keep up your eco-friendly habits today.";
  }
}

/**
 * Get local sustainability tips based on user's city.
 */
export async function getLocalTips(city: string): Promise<string[]> {
  const prompt = `${SYSTEM_PROMPT}

Provide 4 local sustainability tips specific to ${city}.
Include local transit options, recycling programs, farmers markets, etc.
Respond ONLY with a JSON array of 4 tip strings.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getDefaultLocalTips();
    return JSON.parse(jsonMatch[0]);
  } catch {
    return getDefaultLocalTips();
  }
}

/**
 * Estimate savings from a proposed behavior change.
 */
export async function estimateSavings(change: {
  currentBehavior: string;
  proposedChange: string;
  frequency: string;
}): Promise<{ monthlySavingKg: number; explanation: string }> {
  const prompt = `${SYSTEM_PROMPT}

Estimate CO2 savings for this behavior change:
Current: ${change.currentBehavior}
Proposed: ${change.proposedChange}
Frequency: ${change.frequency}

Respond ONLY with JSON: {"monthlySavingKg": <number>, "explanation": "brief explanation"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { monthlySavingKg: 0, explanation: "Unable to estimate" };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { monthlySavingKg: 0, explanation: "Unable to estimate at this time" };
  }
}

// ---- Fallback defaults ----

function getDefaultRecommendations() {
  return [
    {
      suggestion: "Replace 2 car trips per week with cycling or walking to save approximately 18 kg CO2 per month.",
      category: "TRANSPORT",
      estimatedSavingKg: 18,
      priority: "high" as const,
      actionType: "replace" as const,
    },
    {
      suggestion: "Switch to LED bulbs throughout your home to reduce electricity emissions by 15%.",
      category: "ELECTRICITY",
      estimatedSavingKg: 8,
      priority: "medium" as const,
      actionType: "reduce" as const,
    },
    {
      suggestion: "Try 3 vegetarian days per week to reduce food-related emissions significantly.",
      category: "FOOD",
      estimatedSavingKg: 12,
      priority: "high" as const,
      actionType: "replace" as const,
    },
    {
      suggestion: "Buy second-hand clothing instead of new to save ~10 kg CO2 per item.",
      category: "SHOPPING",
      estimatedSavingKg: 10,
      priority: "medium" as const,
      actionType: "reduce" as const,
    },
    {
      suggestion: "Start composting food waste to divert it from landfill and reduce methane emissions.",
      category: "WASTE",
      estimatedSavingKg: 5,
      priority: "low" as const,
      actionType: "reduce" as const,
    },
  ];
}

function getDefaultGoals() {
  return [
    "Walk or cycle for at least 3 commutes this week",
    "Eat plant-based meals for 2 days this week",
    "Reduce standby power by unplugging unused electronics each night",
  ];
}

function getDefaultLocalTips() {
  return [
    "Use your city's public transit system for daily commutes",
    "Visit local farmers markets for fresh, low-carbon produce",
    "Check if your municipality offers free composting bins",
    "Look into community solar programs in your area",
  ];
}
