"use client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Switch } from '../ui/switch'

import { updateDefaultAccout } from '@/actions/accountActions'
import useFetch from '@/hooks/useFetch'
import { toast } from 'sonner'
  
const AccountCard = (account:any) => {

  const [switchState,setSwitchState]=useState(account.isDefault);
  const [data,loading,error,fetchData]=useFetch(updateDefaultAccout);
  
  useEffect(()=>{
    if(data && !loading){
      toast.success(data.message);
    }
  },[data,loading]);

  useEffect(()=>{
    if(error){
      toast.error("something went wrong");
    }
  },[error])
  
  const updateDefault=async(e:any)=>{
    e.preventDefault();
    if(account.isDefault){
      toast.warning('one default account must be true')
      return ;
    }
    await fetchData(account.id);
    // console.log("account",account);
  }
  
  return (
    <Card className='hover:shadow-md h-[100%] transition-shadow cursor-pointer border-dashed'>
        
  <CardHeader>
    <CardTitle className='font-extrabold text-2xl'>{account.name}</CardTitle>
    <Switch disabled={loading } checked={account.isDefault} onClick={(e)=>updateDefault(e)}/>
  </CardHeader>
  <Link href={`/account/${account.id}`}>
  <CardContent>
    <div className='text-2xl font-bold'>
        {parseFloat(account.balance).toFixed(2)}
    </div>
    <p>
        {account.type}  account
    </p>
  </CardContent>
  <CardFooter>
  <div className='mr-4'>
        <ArrowLeft className='mr-1 h-4 w-4 text-green-500'/>
        Expenses
    </div>
    <div>
        <ArrowRight className='mr-1 h-4 w-4 text-green-500'/>
        Income
    </div>
  
  </CardFooter>
  </Link>
</Card>

  )
}

export default AccountCard
