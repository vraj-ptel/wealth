import { seedTransactions } from "@/actions/seed";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){
    const result =await seedTransactions();
//     const r=await prisma.transaction.create({
//         data:{
//              type: "EXPENSE",
//        amount: 259.44,
//        description: "Paid for transportation",
//    date: new Date("2025-05-10T10:42:34.472Z"),
//       category: "transportation",
//       status: "COMPLETED",
//      userId: "2d5ae63d-0f25-4e58-b18a-a5600eb3e66a",
//          accountId: "629fa44e-ec9c-4f7f-a339-b8fe8dddd29c,
//         }
//     })
    console.log("result",result);
    return NextResponse.json({result})
}