"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { subDays } from "date-fns"
import { revalidatePath } from "next/cache";
export async function getCurrentBudget(accountId:string){
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
        const budget=await prisma.budget.findFirst({where:{userId:user.id}})

        const currentDate=new Date();
        const startOfMonth=new Date(currentDate.getFullYear(),currentDate.getMonth());
        const endOfMonth=new Date(currentDate.getFullYear(),currentDate.getMonth()+1,0);
        const expenses=await prisma.transaction.aggregate({
            where:{
                userId:user.id,
                type:"EXPENSE",
                createdAt:{gte:startOfMonth,lt:endOfMonth},
                accountId:accountId

            },
            _sum:{amount:true}
        })
        return {
            budget:budget?{...budget,amount:budget.amount.toNumber()}:null,
            currenetExpenses:expenses._sum.amount?expenses._sum.amount.toNumber():0
        }
        
    }catch(error){
        console.log('error fetching budget',error);
        throw error;
    }
}

export async function updateBudge(amount:number){
    try {
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

        const budget=await prisma.budget.findFirst({where:{userId:user.id}})
        let b=null;
        if(budget){
            
           b= await prisma.budget.update({
                where:{id:budget.id},
                data:{amount:amount}
           })
        }else{
           b= await prisma.budget.create({
                data:{amount:amount,userId:user.id}
            })
        }
        // const budget=await prisma.budget.upsert({
        //     where:{userId:user.id},
        //     update:{amount:amount},
        //     create:{amount:amount,userId:user.id}
        // })
        revalidatePath('/dashboard');
        return {
            success:true,
            data:{...b,amount:b.amount.toNumber()}
        }
    } catch (error) {
        console.log("error updating budget",error);
        throw error
    }
}