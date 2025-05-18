"use server";
import aj from "@/lib/arcjet";
import prisma from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

type TransactionType = "INCOME" | "EXPENSE";
type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type TransactionStatus = "PENDING" | "PROCESSED";

//googl
const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface Transaction {
  type: TransactionType;
  amount: string; // or Prisma.Decimal if you use it
  description?: string | null;
  accountId: string;
  date: Date;
  category: string;
  receiptUrl?: string | null;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  nextRecurringDate?: Date | null;
  lastProcessed?: Date | null;
  status?: TransactionStatus | null;
}

const searlizeTransaction = (obj: any) => {
  return {
    ...obj,
    amount: obj?.amount.toNumber(),
  };
};

const calculateNextRecurringDate = (
  stateDate: Date,
  RInterval: RecurringInterval
): Date => {
  const nextRecurringDate = new Date(stateDate);
  switch (RInterval) {
    case "DAILY":
      return new Date(nextRecurringDate.setDate(stateDate.getDate() + 1));
    case "WEEKLY":
      return new Date(nextRecurringDate.setDate(stateDate.getDate() + 7));
    case "MONTHLY":
      return new Date(nextRecurringDate.setMonth(stateDate.getMonth() + 1));
    case "YEARLY":
      return new Date(
        nextRecurringDate.setFullYear(stateDate.getFullYear() + 1)
      );
  }
};
export async function addTransaction(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User unauthorized");
    }
    //arc jet to add rate limiting
    const req = await request();
    //check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, //how many token to consume
    });
    console.log("decision", decision);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { reset, remaining } = decision.reason;
        console.log({
          code: "Rate limit exceeded",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error("Request Blocked. Please try again later.");
    }

    const user = await prisma.user.findUnique({
      where: { clearkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const account = await prisma.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });
    if (!account) {
      throw new Error("Account not found");
    }

    const balanceChange =
      account.balance + data.type === "EXPENSE"
        ? Number(data.amount) * -1
        : Number(data.amount);

    const transaction = await prisma.$transaction(async function (tx) {
      const newTrans = await tx.transaction.create({
        data: {
          ...data,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          category: data.category,
          receiptUrl: data.receiptUrl,
          recurringInterval: data.recurringInterval,
          lastProcessed: data.lastProcessed,
          status: data.status,
          userId: user.id,
          accountId: data.accountId,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: balanceChange },
      });
      return newTrans;
    });
    return { ...transaction, amount: Number(transaction?.amount) };
  } catch (error) {
    console.log("error creating transactions", error);
    throw error;
  }
}

export async function scanRecipt(file: File) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User unauthorized");
    }
    const user = await prisma.user.findUnique({
      where: { clearkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const model = await genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");
     const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);
    const response=await result.response;
    const text=response.text();
    
       const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }

  } catch (error) {
    console.log("error creating transactions", error);
    throw new Error("failed to read receipt");
  }
}

export async function getTransaction(id:string){
  try{
    const {userId}=await auth();
    if(!userId){
        throw new Error("User unauthorized");
    }
    const user=await prisma.user.findUnique({
        where:{clearkUserId:userId}
    })
    if(!user){
        throw new Error("User not found");
    }
    const transaction=await prisma.transaction.findUnique({
        where:{id:id,userId:user.id}
    })
    if(!transaction){
      throw new Error("transaction not found");
    }
    return {...transaction,amount:transaction.amount.toNumber()};
  }catch(error){
    console.log("error creating transactions", error);
    throw error;
  }
}

export async function updateTransaction(transId:string,data:any){
  try{
    const {userId}=await auth();
    if(!userId){
        throw new Error("User unauthorized");
    }
    const user=await prisma.user.findUnique({
        where:{clearkUserId:userId}
    })
    if(!user){
        throw new Error("User not found");
    }
    const originalTransaction=await prisma.transaction.findUnique({
      where:{
        id:transId,
        userId:user.id
      },
      include:{account:true}
    });
    if(!originalTransaction){
      throw new Error("transaction not found");
    }
    const oldBalanceChange=originalTransaction.type==="EXPENSE"?Number(originalTransaction.amount)*-1:Number(originalTransaction.amount);
    const newBalanceChange=data.type==="EXPENSE"?Number(data.amount)*-1:data.amount;
    const netBalaceChange=newBalanceChange-oldBalanceChange;
    await prisma.transaction.update({
      where:{id:transId},
      data:data
    })
    const transactions=await prisma.$transaction(async(tx)=>{
      const update=await tx.transaction.update({
        where:{
          id:transId,
          userId:user.id
        },
        data:{
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        }
      })
      await tx.account.update({
        where:{id:originalTransaction.accountId},
        data:{balance:{increment:netBalaceChange}}
      })
      return update;
    })
    revalidatePath('/dashboard');
    revalidatePath(`account/${data.accountID}`)
    return {success:true,transaction:{...transactions,amount:transactions.amount.toNumber()}};
  }catch(error:any){
    console.log("error creating transactions", error);
    throw new Error(error.message);
  }
}