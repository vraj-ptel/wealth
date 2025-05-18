"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const date_range = {
  "7D": { label: "7D", days: 7 },
  "1M": { label: "7D", days: 30 },
  "3M": { label: "7D", days: 90 },
  "6M": { label: "7D", days: 180 },
};
type GroupedData = {
  date: any;
  income: number;
  expense: number;
};

type dateRange = "7D" | "1M" | "3M" | "6M";
const AccountChart = ({ transactions }: { transactions: any }) => {
  const [dateRange, setDateRange] = useState<dateRange>("1M");
  const filterdData = useMemo(() => {
    const range = date_range[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    //filtered transactions
    const filtered = transactions.filter((t: any) => {
      return new Date(t.date) >= startDate && new Date(t.date) < endOfDay(now);
    });

    const grouped: any = {};
    filtered.forEach((trans: any) => {
      const dateLabel = format(new Date(trans.date), "MMM dd");
      if (!grouped[dateLabel]) {
        grouped[dateLabel] = { income: 0, expense: 0, date: dateLabel };
      }
      if (trans.type == "INCOME") {
        grouped[dateLabel].income += Number(trans.amount);
      } else {
        grouped[dateLabel].expense += Number(trans.amount);
      }
    });

    // const g=filtered.reduce((acc:Record<string,{income:number,expense:number}>,cur:any)=>{
    //     const date=format(new Date(cur.date),"mmm dd");
    //      if(!acc[date]){
    //         acc[date]={income:0,expense:0}
    //      }
    //     if(cur.type==='INCOME'){

    //         acc[date].income+=Number(cur.amount);
    //     }else{
    //         acc[date].expense+=Number(cur.amount);
    //     }
    // },{})
    // console.log("dkfjslkdf",grouped );
    return Object.values(grouped).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [dateRange, transactions]);

//   console.log('filtereddata',filterdData)
  const total: any = useMemo(() => {
    return filterdData.reduce(
      (acc: any, cur: any) => {
        acc.income += cur.income;
        acc.expense += cur.expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filterdData]);

  // const data=useMemo(()=>{
  //     return filterdData.map((d:any)=>{
  //         return {
  //             name:d.date,
  //             income:d.income,
  //             expense:d.expense,
  //         }
  //     })
  // },[filterdData])

  return (
    <div className="my-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row justify-between space-y-0">
          <CardTitle>Transaction Overview</CardTitle>
          <Select
            value={dateRange}
            onValueChange={(val) => setDateRange(val as dateRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7D">Last 7 days</SelectItem>
              <SelectItem value="1M">Last 1 month</SelectItem>
              <SelectItem value="3M">Last 3 months</SelectItem>
              <SelectItem value="6M">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Income</span>
              <span className="text-sm font-medium text-green-500">
                {total.income.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Expenses</span>
              <span className="text-sm font-medium text-red-500">
                {total.expense.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Net Income</span>
              <span className="text-sm font-medium">
                {(total.income.toFixed(2)-total.expense.toFixed(2)).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="h-[300px]">
          
            <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={filterdData}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="date" />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value.toFixed(2)}`}/>
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
          <Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]}  />
          <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]}   />
        </BarChart>
      </ResponsiveContainer>
    
     </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountChart;
