export const dynamic = "force-dynamic";
import { getAccounts, getDashboardData } from "@/actions/accountActions";
import { getCurrentBudget } from "@/actions/budget";
import CreateAccountDrawer from "@/components/shared/CreateAccountDrawer";
import AccountCard from "@/components/specific/AccountCard";
import BudgetProgress from "@/components/specific/BudgetProgress";
import DashboardOverView from "@/components/specific/DashboardOverView";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";

const page = async () => {
  const accounts = await getAccounts();
  // console.log("accounts",accounts?.accounts);
  const defaultAccount = accounts?.accounts.find((acc) => acc.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
    // console.log("budgetData", budgetData);
  }

  const transactions=await getDashboardData();

  return (
    <div className="mt-14 px-4">
      <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600  to-violet-600 text-4xl">
        Dashboard
      </h1>
      {/* budget progress  */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
        
          currentExpenses={budgetData?.currenetExpenses!}
        />
      )}
      {/* overview  */}
      <Suspense fallback={<div>Loading Overview...</div>}>
        <DashboardOverView accounts={accounts?.accounts} transactions={transactions}/>
      </Suspense>


      {/* account grid  */}
      <div className="grid sm:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md h-[100%] transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts?.accounts.length &&
          accounts.accounts.map((acc) => {
            return <AccountCard key={acc.id} {...acc} />;
          })}
      </div>
    </div>
  );
};

export default page;
