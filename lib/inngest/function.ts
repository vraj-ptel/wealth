import { sendEmail } from "@/actions/sendemail";
import prisma from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/MyEmail";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlert = inngest.createFunction(
  { id: "check budget alert" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await prisma.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) {
        continue;
      }

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();

        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth()
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        // startDate.setDate(1);
        const expenses = await prisma.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: {
            amount: true,
          },
        });
        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;
        // sending emailss
        if (
          percentageUsed > 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(budget.lastAlertSent, new Date()))
        ) {
          //send email
          await sendEmail({
            to: budget.user.email,
            subject: "budget-alert",
            reactElement: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: { budgetAmount, percentageUsed, totalExpenses },
            })!,
          });
          //update lastalertsent
          await prisma.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isNewMonth(lastAlertSent: any, newDate: Date) {
  return (
    new Date(lastAlertSent).getFullYear() !== newDate.getFullYear() ||
    new Date(lastAlertSent).getMonth() !== newDate.getMonth()
  );
}

export const triggerReccuringTransaction = inngest.createFunction(
  {
    id: "trigger recurring transaction",
    name: "trigger recurring transaction",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const transactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return prisma.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { nextRecurringDate: { lte: new Date() } },
              { lastProcessed: null },
            ],
          },
        });
      }
    );

    //create events for each transaction
    if (transactions.length > 0) {
      const events = transactions.map((trans) => {
        return {
          name: "transaction-recurring.process",
          data: { transactionId: trans.id, userId: trans.userId },
        };
      });
      await inngest.send(events);
    }
    return { triggered: transactions.length };
  }
);

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10, //only 10 trasaction process,
      period: "1m", //perm minute
      key: "event.data.userId", //per user
    },
  },
  { event: "transaction-recurring.process" },
  async ({ event, step }) => {
    //validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.log("invalid event data", event);
      return { error: "missing required fields" };
    }
    await step.run("process-transaction", async () => {
      const transactions = await prisma.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transactions || !isTransactionDue(transactions)) {
        return;
      }

      await prisma.$transaction(async (tx) => {
        //transaction create
        await tx.transaction.create({
          data: {
            type: transactions.type,
            amount: transactions.amount,
            description: `${transactions.description} (Recurring)`,
            date: new Date(),
            category: transactions.category,
            accountId: transactions.accountId,
            userId: transactions.userId,
            isRecurring: false,
          },
        });
        //balace update
        const accountBalaceUpdate =
          transactions.type === "EXPENSE"
            ? Number(transactions.amount) * -1
            : transactions.amount;

        //account update
        await tx.account.update({
          where: {
            id: transactions.accountId,
          },
          data: {
            balance: { increment: accountBalaceUpdate },
          },
        });

        //update transaction
        await tx.transaction.update({
          where: {
            id: transactions.id,
          },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              transactions.date,
              transactions.recurringInterval
            ),
          },
        });
      });
    });
  }
);

function isTransactionDue(transaction: any) {
  //if no last proceddated then its due
  if (!transaction.lastProcessed) return true;

  const nextRecurringDate = new Date(transaction.nextRecurringDate);
  return nextRecurringDate <= new Date();
}

const calculateNextRecurringDate = (
  lastProcessed: any,
  recurringInterval: any
) => {
  const nextRecurringDate = new Date(lastProcessed);
  switch (recurringInterval) {
    case "DAILY":
      return new Date(
        nextRecurringDate.setDate(nextRecurringDate.getDate() + 1)
      );
    case "WEEKLY":
      return new Date(
        nextRecurringDate.setDate(nextRecurringDate.getDate() + 7)
      );
    case "MONTHLY":
      return new Date(
        nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1)
      );
    case "YEARLY":
      return new Date(
        nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1)
      );
  }
};

export const generateMonthlyReport = inngest.createFunction(
  {
    id: "generate-monthly-report",
    name: "generate-monthly-report",
  },
  {
    cron: "0 0 1 * *",
  },
  async ({ step }) => {
    const users = await step.run("fetch-user", async () => {
      return await prisma.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-monthly-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });
        const stats = await getMonthlyStats(user.id, lastMonth);
        // console.log("stats", stats);
        const insights = await generateFinancialInsights(stats, monthName);
        // console.log("insights", insights);
        //send email
        await sendEmail({
          to: user.email,
          subject: `${monthName} Financial Report`,
          reactElement: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: { stats, insights, month: monthName },
          })!,
        });
      });
    }
    return { pocessed: users.length };
  }
);

const generateFinancialInsights = async (stats: any, month: any) => {
  const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
};
const getMonthlyStats = async (userId: string, month: Date) => {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats: any, t: any) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );

  return transactions;
};
