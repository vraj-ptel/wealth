"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";
import { object } from "zod";

type accountType = "CURRENT" | "SAVING";

export type account = {
  balance: string;
  isDefault: boolean;
  name: string;
  type: accountType;
};

const serializeBalace = (account: any) => {
  const serializeBalace = { ...account };
  if (serializeBalace.balance) {
    serializeBalace.balance = serializeBalace.balance.toNumber();
  }
  if(serializeBalace.amount){
    serializeBalace.amount = serializeBalace.amount.toNumber();
  }
  return serializeBalace;
};

export async function createAccount(data: account) {
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

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance");
    }
    const exisitingAccounts = await prisma.account.findMany({
      where: { userId: user.id },
    });

    const showDefault = exisitingAccounts.length === 0 ? true : data.isDefault;

    //if account is default then make other account non default
    if (showDefault) {
      await prisma.account.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const account = await prisma.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: showDefault,
      },
    });

    revalidatePath("/dashboard");
    const serializeAccount = serializeBalace(account);
    return { success: true, account: serializeAccount };
  } catch (error) {
    console.log(error);
  }
}

export async function getAccounts() {
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
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy:{createdAt:'desc'},
      include:{_count:{select:{transactions:true}}}
    });
    const serializeAccounts = accounts.map((acc)=>serializeBalace(acc));
    return { success: true, accounts: serializeAccounts };
  } catch (error:any) {
    console.log(error);
    toast.error(error?.message  ||"something went wrong" );
  }
}

export async function updateDefaultAccout(accountId:string){
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
    
    await prisma.account.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
    await prisma.account.update({
      where: { id: accountId },
      data: { isDefault: true },
    });
    revalidatePath("/dashboard");
    return { success: true ,message:'default account changed'};
  } catch (error:any) {
    console.log(error);
    toast.error(error?.message  ||"something went wrong" );

  }
}


export async function getAccountDataById(accountId:string){
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
    const account = await prisma.account.findUnique({
      where: { id: accountId ,userId:user.id},
      include:{
        transactions:{orderBy:{createdAt:'desc'}},
        _count:{select:{transactions:true}}
      }
    });
    const trans=account?.transactions.map((acc)=>serializeBalace(acc));
   
    
    return { success: true, account: account,transactions:trans };
  } catch (error) {
    console.log(error);
  }
}

export async function bulkDeleteTransaction(transactionsIds:string[] ){
  try {
    console.log("call")
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

    const transactions=await prisma.transaction.findMany({
      where:{
        id:{in:transactionsIds},
        userId:user.id
      }
    })
    
    console.log("transactions",transactions)
    let sumOfExpenses=0;
    let sumofIncomes=0;
     const accountBalanceChanges=transactions.reduce((acc:Record<string,number>,cur)=>{
      const change=cur.type==="EXPENSE"?cur.amount:-cur.amount;
      if(cur.type==="EXPENSE")sumOfExpenses+=Number(cur.amount);
      if(cur.type==="INCOME")sumofIncomes+=Number(cur.amount);
      acc[cur.accountId]=(acc[cur.accountId]||0)+Number(change);
      return acc;
    },{})
    // const accountBalanceChanges=transactions.reduce((acc,cur)=>{
    //   const change=cur.type==="EXPENSE"?cur.amount:-cur.amount;
    //   if(cur.type==="EXPENSE")sumOfExpenses+=Number(cur.amount);
    //   if(cur.type==="INCOME")sumofIncomes+=Number(cur.amount);
    //   acc[cur.accountId]=(acc[cur.amountId]||0)+change;
    //   return acc;
    // },{})
    console.log("sumof expenses",sumOfExpenses,"sumof incomes",sumofIncomes);
    console.log("sum of acc change",accountBalanceChanges);
    //delete transactions
    await prisma.$transaction(async(tx)=>{
      //delete transaction
      await tx.transaction.deleteMany({
        where:{
          id:{in:transactionsIds},
          userId:user.id
        }
      })

      for(const [accountId,balanceChange] of Object.entries(accountBalanceChanges)){
        await tx.account.update({
          where:{id:accountId},
          data:{balance:{increment:balanceChange}}  
        })
      }
    })
    revalidatePath(`/account/[id]`);
    revalidatePath('/dashboard')

    return { success: true ,message:`Deleted ${transactions.length} transactions`};

  } catch (error) {
    console.log('error',error)
    throw error
  }
}

export async function getDashboardData(){
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
    //get all user transaction
    const transactions=await prisma.transaction.findMany({
      where:{
        userId:user.id
      },
      orderBy:{date:'desc'}
    })
    
    const serializeTransactions = transactions.map((trans)=>serializeBalace(trans));
    return serializeTransactions;
  } catch (error) {
    console.log(error);
    throw error
  }
}