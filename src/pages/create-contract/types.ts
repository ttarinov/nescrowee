import { AI_MODELS } from "@/types/ai";

export type ModelId = (typeof AI_MODELS)[number]["id"];

export interface MilestoneForm {
  id: string;
  title: string;
  description: string;
  amount: string;
  timelineDays: string;
}

export type UserRole = "client" | "freelancer";
