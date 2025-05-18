import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlert, generateMonthlyReport, processRecurringTransaction, triggerReccuringTransaction } from "@/lib/inngest/function";
import { serve } from "inngest/next";
// import { inngest } from "../../../inngest/client";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    checkBudgetAlert,
    processRecurringTransaction,
    triggerReccuringTransaction,
    generateMonthlyReport
  ],
});
