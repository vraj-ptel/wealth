import {
  SignedIn,
  SignedOut,
  SignUpButton,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { LayoutDashboard, PenBoxIcon } from "lucide-react";
import checkUser from "@/lib/checkUser";

const Header = async() => {
  const u=await checkUser()
  return (
    <div className="fixed h-14 bg-gray-200/20 top-0 left-0 w-full backdrop-blur-sm z-20 border-b">

      <nav className="flex items-center justify-between w-full p-4 ">
        <Link href="/">
          <h2>
            <span className="text-2xl font-bold bg-gradient-to-br from:indigo-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Wea
            </span>
            <span className="text-2xl font-bold">lth</span>
          </h2>
        </Link>
        {/* menu  */}
        <div className="flex gap-4">
          <SignedIn>
            <Link  href={'/dashboard'} className="flex sm:text-2xl  text-sm"><LayoutDashboard /> Dashboard</Link>
            <Link href={'/transaction/create'} className=" flex text-sm sm:text-2xl"><PenBoxIcon /> Add Transaction</Link>
          </SignedIn>
        </div>
        <div className="flex gap-2">
          <SignedOut>
            <SignInButton forceRedirectUrl="/sign-in">
              <Button variant={'outline'} className={'cursor-pointer'}>Sign In</Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/sign-up">
              <Button variant={'outline'} className={'cursor-pointer'}>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton/>
            <SignOutButton>
              <Button variant={'outline'} className={'cursor-pointer'}>Sign Out</Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
