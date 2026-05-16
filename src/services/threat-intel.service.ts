import { aiDailySecurityBrief } from "@/ai/flows/ai-threat-intelligence";
import type { DailyBriefOutput } from "@/ai/flows/ai-threat-intelligence";

export async function fetchDailyBrief(): Promise<DailyBriefOutput | null> {
  try {
    const data = await aiDailySecurityBrief({});
    return data;
  } catch (error) {
    console.error("Failed to load brief", error);
    return null;
  }
}
