import { getAccounts } from "@/actions/accountActions";
import { getTransaction } from "@/actions/transaction";
import AddTransaction from "@/components/specific/AddTransaction";
import { defaultCategories } from "@/data/category";
import React from "react";

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}
const page = async ({ searchParams}: PageProps) => {
  const account = await getAccounts();
  
  // console.log("edit",searchParams)
  const editId=searchParams?.edit;
  let initialData={};
  console.log("editid",editId);
  if(editId){
    const transactions=await getTransaction(editId as string);
    initialData=transactions
  }
  

  return (
    <div className="mt-15 max-w-3xl mx-auto px-4 rounded-lg shadow-lg ">
      <h1 className="text-center text-3xl font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent ">
        Add Transaction
      </h1>
      <AddTransaction account={account?.accounts } editMode={!!editId} initialData={initialData} categories={defaultCategories}/>
    </div>
  );
};

export default page;
