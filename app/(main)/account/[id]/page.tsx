import { getAccountDataById } from "@/actions/accountActions";
import AccountChart from "@/components/specific/AccountChart";
import Transactiontabe from "@/components/specific/Transactiontabe";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const accountData = await getAccountDataById(id);

  if (!accountData?.account) {
    notFound();
  }
  const { account, transactions } = accountData;

  // console.log("accountData",transactions);
  return (
    <div className="  px-5 pt-10 mt-14">
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {account.name}
          </h1>
          <p className="text-gray-900/50">
            {account.type.toUpperCase()} Account
          </p>
        </div>
        <div>
          <div className="text-3xl font-bold">
            ₹{account.balance.toFixed(2)}
          </div>
          <p className="text-gray-900/50">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>
      {/* chart section  */}
      <Suspense fallback={<BarLoader width={"100%"} color={"#3b82f6"} />}>
        <AccountChart transactions={transactions}  />
      </Suspense>
      {/* transaction table  */}
      <Suspense fallback={<BarLoader width={"100%"} color={"#3b82f6"} />}>
        <Transactiontabe transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default page;
