
import {z} from 'zod'

export const accountSchema=z.object({
    name:z.string().nonempty('enter a name'),
    type:z.enum(["CURRENT","SAVING"]).default("CURRENT"),
    balance:z.string().min(1,'initial balance is required'),
    isDefault:z.boolean().default(false)
})

export const transactionSchema=z.object({
    amount:z.string().min(1,"enter an amount"),
    description:z.string().nonempty('enter a description'),
    type:z.enum(["EXPENSE","INCOME"]),
    date:z.date({required_error:"enter a date"}),
    accountId:z.string().min(1,"select an account"),
    category:z.string().nonempty('enter a category'),
    isRecurring:z.boolean().default(false),
    recurringInterval:z.enum(["DAILY","WEEKLY","MONTHLY","YEARLY"]).optional(),
     // receiptUrl:z.string().optional(),
    // nextRecurringDate:z.string().optional(),
    // lastProcessed:z.string().optional(),
    // status:z.enum(["COMPLETED","PENDING","CANCELLED"]).optional()
}).superRefine((data,ctx)=>{
    if(data.isRecurring && !data.recurringInterval){
        ctx.addIssue({
            code:"custom",
            message:"recurring interval is required",
            path:['recurringInterval']
        })
    }
})