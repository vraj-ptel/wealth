"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { transactionSchema } from "../formschema/schema";
import useFetch from "@/hooks/useFetch";
import { addTransaction, updateTransaction } from "@/actions/transaction";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CreateAccountDrawer from "../shared/CreateAccountDrawer";
import { format } from "date-fns";
import { Calendar1Icon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Switch } from "../ui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import Receiptscanner from "./Receiptscanner";
import { RecurringInterval } from "@/lib/generated/prisma";

type aiReadedData = {
  amount: number;
  category: string;
  date: Date;
  description: string;
  merchantName: string;
};

const AddTransaction = ({
  account,
  categories,
  editMode = false,
  initialData = null,
}: {
  account: any;
  categories: any;
  initialData: any;
  editMode?: any;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  //   console.log("accounts", account);

  // let initialDataRecurringInterval =
  //   editMode && initialData && initialData.recurringInter
  //     ? { recurringInterval: initialData.recurringInter }
  //     : {};
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
       {
            type: "EXPENSE",
            isRecurring: false,
            amount: "",
            description: "",
            accountId: account?.find((acc: any) => acc.idDefault == true)?.id,
            date: new Date(),
          },
  });

  //filteredcategory
  const filteredcategory = categories.filter(
    (cat: any) => cat.type === getValues("type")
  );

  //create transaction api
 
  const [data, loading, error, fetchData] = useFetch(addTransaction);

  //onsubmit

  const onsubmit = async (data: any) => {
    console.log(data, "data");
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
   
         await fetchData(formData);
    
 
  };

  useEffect(() => {
    if (data && !loading) {
      toast.success(editId?"transaction updated successfully":"transaction added successfully");
      reset();
      console.log("data", data);
      const accountId = data?.accountId;
      router.push(`/account/${accountId}`);
    }
  }, [data, loading,editMode]);

  useEffect(() => {
    if (error) {
      console.log(error);
      toast.error(error?.message || "something went wrong");
    }
  }, [error]);

  //scan complete

  const handleComplate = async (scanData: aiReadedData | null) => {
    if (scanData) {
      const { amount, category, date, description, merchantName } = scanData;
      setValue("amount", amount.toString());
      setValue("category", category);
      setValue("date", date);
      setValue("description", description);
      // setValue("merchantName",merchantName);
    }
  };

  return (
    <div className="py-4">
      {/* ai receipt scanner  */}
      <Receiptscanner onScanComplete={handleComplate} />
      {/* form  */}
      <div>
        <div className="w-full my-3">
          <BarLoader
            color="#36d7b7"
            loading={loading}
            width={"100%"}
            className="h-2 bg-red-30"
          />
        </div>
        <form onSubmit={handleSubmit(onsubmit)}>
          {/* trans type  */}
          <div className="w-[100%]">
            <label className="text-md font-semibold">type</label>
            <Select
              value={watch("type")}
              onValueChange={(e: any) => setValue("type", e)}
            >
              <SelectTrigger className="w-[100%]">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.type && <span className="text-red-500">{}</span>}
          </div>

          {/* amount and account  */}

          <div className="flex flex-row w-[100%] gap-3">
            <div className="w-[50%]">
              <label className="text-md font-semibold">amount</label>
              <Input
                {...register("amount")}
                type="number"
                placeholder="amount"
              />
              {errors.amount && (
                <span className="text-red-500">{errors.amount.message}</span>
              )}
            </div>
            <div className="w-[50%]">
              <label className="text-md font-semibold">account</label>
              <Select
                value={watch("accountId")}
                onValueChange={(e: any) => setValue("accountId", e)}
              >
                <SelectTrigger className="w-[100%]">
                  <SelectValue placeholder="Select a account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {account.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <CreateAccountDrawer>
                    <Button className="w-[100%]" variant={"outline"}>
                      Create Account
                    </Button>
                  </CreateAccountDrawer>
                </SelectContent>
              </Select>
              {errors.accountId && (
                <span className="text-red-500">
                  {errors?.accountId?.message}
                </span>
              )}
            </div>
          </div>

          {/* categoriess */}

          <div>
            <label className="text-md font-semibold">categories</label>
            <Select
              value={watch("category")}
              onValueChange={(e: any) => setValue("category", e)}
            >
              <SelectTrigger className="w-[100%]">
                <SelectValue placeholder="Select a account" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {filteredcategory.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.category && (
              <span className="text-red-500">{errors.category.message}</span>
            )}
          </div>

          {/* description  */}
          <div>
            <label className="text-md font-semibold">description</label>
            <Input
              {...register("description")}
              type="text"
              placeholder="description"
            />
            {errors.description && (
              <span className="text-red-500">{errors.description.message}</span>
            )}
          </div>

          {/* date  */}

          <div>
            <label className="font-semibold text-md">Date</label>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full pl-3 text-left font-normal"
                    variant={"outline"}
                  >
                    {watch("date")
                      ? format(new Date(getValues("date")), "PPP")
                      : "select date"}
                    <Calendar1Icon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={getValues("date")}
                    onSelect={(date) => setValue("date", date!)}
                    initialFocus
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.date && (
              <span className="text-red-500">{errors.date.message}</span>
            )}
          </div>

          {/* is isRecurring  */}
          <div className="space-y-2 flex flex-row w-full justify-between my-2 ">
            <div className="space-y-0.5">
              <label htmlFor="idDefault">Reccuring Trasnsaction</label>
              <p>set up Reccuring sachdule for this transaction</p>
            </div>
            <Switch
              id="idDefault"
              checked={watch("isRecurring")}
              onCheckedChange={(val) => setValue("isRecurring", val)}
            />

            {errors.isRecurring && (
              <span className="text-red-500">{errors.isRecurring.message}</span>
            )}
          </div>

          {/* select recurring intervel  */}

          <div>
            {getValues("isRecurring") && (
              <div className="w-[100%]">
                <label className="text-md font-semibold">type</label>
                <Select
                  value={watch("recurringInterval")}
                  onValueChange={(e: any) => setValue("recurringInterval", e)}
                >
                  <SelectTrigger className="w-[100%]">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="DAILY">DAILY</SelectItem>
                      <SelectItem value="WEEKLY">WEEKLY</SelectItem>
                      <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                      <SelectItem value="YEARLY">YEARLY</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.recurringInterval && (
                  <span className="text-red-500">
                    {errors.recurringInterval.message}
                  </span>
                )}
              </div>
            )}

            {/* cancel or submit  */}
            <div className="w-full flex justify-center gap-4">
              <Button
                className="cursor-pointer"
                variant={"outline"}
                onClick={() => router.back()}
              >
                Cacel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={loading}
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
