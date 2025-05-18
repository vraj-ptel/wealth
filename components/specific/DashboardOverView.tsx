"use client";
import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Label, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  
  Tooltip,
  Legend,
} from "recharts";
const colors = [
  "#845EC2", // Purple
  "#D65DB1", // Pink
  "#FF6F91", // Coral
  "#FF9671", // Orange
  "#FFC75F", // Yellow
  "#F9F871", // Light Yellow
  "#2C73D2", // Blue
  "#0081CF", // Sky Blue
  "#008E9B", // Teal
  "#4B4453", // Dark Gray
];

const DashboardOverView = ({
  transactions,
  accounts,
}: {
  transactions: any;
  accounts: any;
}) => {
  // console.log("account",accounts);
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((acc: any) => acc.isDefault).id || accounts[0].id
  );
  //filter transactions from selected account transaction
  const accountTransactions = useMemo(
    () =>
      transactions.filter((trans: any) => trans.accountId == selectedAccountId),
    [selectedAccountId, transactions]
  );
  //sort transactions;
  const recentTransactions = accountTransactions
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  //calculate expenses for current month
  const currentDate = new Date();
  const currentMonthExpense = accountTransactions.filter((t: any) => {
    const transactionDate = new Date(t.date);
    return (
      t.type == "EXPENSE" &&
      transactionDate.getMonth() == currentDate.getMonth() &&
      transactionDate.getFullYear() == currentDate.getFullYear()
    );
  });

  //group current month expense by category
  const currentMonthExpenseByCategory = currentMonthExpense.reduce(
    (acc: any, prev: any) => {
      if (!acc[prev.category]) {
        acc[prev.category] = 0;
      }
      acc[prev.category] += prev.amount;
      return acc;
    },
    {}
  );
  // console.log("currentMonthExpenseByCategory",currentMonthExpenseByCategory);
  const pieData = Object.entries(currentMonthExpenseByCategory).map(
    ([category, amount]) => {
      return {
        name: category,
        value: amount,
      };
    }
  );
  // console.log("daa",data);

  return (
    <div className="grid gap-4  md:grid-cols-2 my-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={(e) => setSelectedAccountId(e)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a account" />
            </SelectTrigger>
            <SelectContent className="w-[140px]">
              {accounts.map((acc: any) => {
                return (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center text-4xl text-gray-900/30">
              There is no Transaction
            </div>
          ) : (
            <div>
              {recentTransactions.map((trans: any) => {
                return (
                  <div
                    className="border rounded-md p-2 my-2 shadow-lg"
                    key={trans.id}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold">
                          {trans.description || "untitled transaction"}
                        </p>
                        <p>{format(new Date(trans.date), "PP")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center ${trans.type === "EXPENSE" ? "text-red-600" : "text-green-600"}`}
                        >
                          {trans.type === "EXPENSE" ? (
                            <ArrowDownRight />
                          ) : (
                            <ArrowUpRight />
                          )}
                          {trans.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthy Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div>
              <div className="text-center text-4xl text-gray-900/30">
                There is no Transaction
              </div>
            </div>
          ) : (
            
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          )}

        </CardContent>
      </Card>
       

      
    </div>
  );
};

export default DashboardOverView;
