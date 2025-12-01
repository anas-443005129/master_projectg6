import type { UserType } from "@/app/(auth)/auth";
import type { ChatModel } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account - Limited to Auto + budget models
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ["auto", "fast-model", "gemini-model"],
  },

  /*
   * For users with an account - Full access to all models
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ["auto", "chat-model", "reasoning-model", "fast-model", "vision-model", "gemini-model"],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
