"use client";
import banner from '@/public/banner.jpeg';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";

const Hero = () => {
    const imagRef=useRef(null)
    useEffect(()=>{
        const imageElement=imagRef.current as HTMLElement |null;
        const handleScrool=()=>{
            const scrollPosition=window.scrollY;
            const scrollThreshold=100;
            if(scrollPosition>scrollThreshold){
                imageElement?.classList.add('scrolled');
            }
        }
        window.addEventListener('scroll',handleScrool);
        return()=>{
            window.removeEventListener('scroll',handleScrool);
        }
    },[])
  return (
    <div className="pb-20 px-4 pt-14">
      <div className=" container mx-auto text-center ">
        <div className="flex items-center justify-center flex-col">
        <h1 className=" font-bold text-4xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600  to-violet-600 text-4xl">Manage Your Finances </span><br />
          With Inteligent
        </h1>
        <p className="py-3 text-gray-900/40 max-w-3xl ">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
          aliquam voluptatibus quasi praesentium fugiat accusantium quod
          quisquam? Ipsum, expedita quae!
        </p>
        </div>
        <div className="pb-3">
            <Link href={'/dashboard'}>
                <Button variant={'outline'}>Get Started</Button>
            </Link>
        </div>
        <div className="hero-image-wrapper">
        <div ref={imagRef} className="hero-image">
            <Image
                src={banner}
                alt={'banner'}
                height={1280}
                width={720}
                priority
                className=" h-[80vh] w-[80vw] object-cover rounded-lg border shadow mx-auto"
            />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
