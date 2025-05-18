import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "wealth",
  name: "wealth",
  retryFunction: async (attempt: any) => {
    return {
      delay: Math.pow(2, attempt) * 1000,
      maxAttempts: 2,
    };
  },
});
