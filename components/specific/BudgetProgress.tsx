"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check, Pencil, X } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { updateBudge } from "@/actions/budget";
import { toast } from "sonner";
import { Progress } from "../ui/progress";

const BudgetProgress = ({
  initialBudget,
  currentExpenses,
}: {
  initialBudget: any;
  currentExpenses: number;
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newBudget, setNewBudget] = React.useState(
    initialBudget?.amount.toString() || ""
  );
  const percentageUsed =    initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    :0 ;

    const [data,loading,error,fetchData]=useFetch(updateBudge)

    useEffect(()=>{
        if(data && !loading){
            toast.success('budget updated successfully');
        }
        if(error){
            toast.error("something went wrong updating budget")
        }
    },[data,loading,error])
  const handleUpadateBudget = async () => {
    const amount=parseFloat(newBudget);
    if(isNaN(amount) || amount<=0){
        toast.error("enter valid number")
    }
    else{
        await fetchData(amount)
        setIsEditing(false);
    }
  };
  const handleCancelBudget = () => {
    setIsEditing(false);
    setNewBudget(initialBudget?.amount.toString() || "");
  };
  return (
    <div>
      <Card >
        <CardHeader className="flex items-center justify-between">
          
          <div className="flex-1">
            <CardTitle>Monthly Current Budget</CardTitle>
            <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="enter amount"
                  className="w-32"
                  autoFocus
                ></Input>
                <Button disabled={loading} variant={'ghost'} size={'icon'} onClick={()=>handleUpadateBudget()}>
                  <Check className="h-4 w-4 text-green-400" />
                </Button>
                <Button disabled={loading}  variant={'ghost'}  size={'icon'} onClick={()=>handleCancelBudget()}>
                  <X className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `₹${currentExpenses.toFixed(
                        2
                      )} of ₹${initialBudget.amount.toFixed(2)}`
                    : "no budget"}

                  <Button size={'icon'} variant={'ghost'} onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4"/>
                  </Button>
                </CardDescription>
              </>
            )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div>
            {initialBudget&&(
                <div>
                     <Progress color="#ef4444" value={percentageUsed}/>
                     <p>{percentageUsed.toFixed(2)}% used out of {initialBudget.amount}</p>
                </div>
            )}
           </div>
        </CardContent>
        
      </Card>
    </div>
  );
};

export default BudgetProgress;
// initialBudget.amount.toString() ||
