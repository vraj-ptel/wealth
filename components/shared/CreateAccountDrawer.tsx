"use client";
import React, { ReactNode, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { accountSchema } from "../formschema/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/useFetch";
import { account, createAccount } from "@/actions/accountActions";
import { toast } from "sonner";

const CreateAccountDrawer = ({ children }: { children: ReactNode }) => {
  
  const [open, SetOpen] = useState(false);
  const [data, loading, error, fetchData] = useFetch(createAccount)
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
     
      isDefault: false,
    },
  });

  useEffect(()=>{
    if(error){
      toast.error( "something went wrong");
    }
  },[error])
  useEffect(()=>{
    if(data && !loading){
      SetOpen(false);
      reset();
      toast.success("Account created successfully");
    }
  },[data])
  const onSubmit = async(data: account) => {
    await fetchData(data);

  };

  return (
    <div>
      <Drawer open={open} onOpenChange={SetOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Account</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <form className="flex gap-2 items-start   justify-center flex-col" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label htmlFor="accname">Account Name</label>
                <Input
                  placeholder="Account Name"
                  id={"accname"}
                  {...register("name")}
                  
                ></Input>
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Select
                  onValueChange={(e) =>
                    setValue("type", e as "CURRENT" | "SAVING")
                  }
                  defaultValue={watch('type')}
                >
                  <SelectTrigger id="type" className="w-[180px]">
                    <SelectValue    placeholder="Select A Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="SAVING">SAVING</SelectItem>
                      <SelectItem value="CURRENT">CURRENT</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <span className="text-red-500">{errors.type.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="balance">Account Balance</label>
                <Input
                  placeholder="Account Name"
                  id="balance"
                  type="number"
                  step="0.01"
                  {...register("balance")}
                ></Input>
                {errors.balance && (
                  <span className="text-red-500">{errors.balance.message}</span>
                )}
              </div>

              <div className="space-y-2 flex flex-row">
                <div className="space-y-0.5">
                  <label htmlFor="idDefault">Set As Default</label>
                  <p>This Account Will Be Used By Default</p>
                </div>
                <Switch
                  id="idDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={(val) => setValue("isDefault", val)}
                />

                {errors.isDefault && (
                  <span className="text-red-500">
                    {errors.isDefault.message}
                  </span>
                )}
              </div>
              <div>
              <Button variant={'outline'} onClick={() => SetOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>Submit</Button>
                
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CreateAccountDrawer;
