"use client";
import { scanRecipt } from "@/actions/transaction";
import useFetch from "@/hooks/useFetch";
import { CameraIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const Receiptscanner = ({ onScanComplete }: { onScanComplete: any }) => {
  const fileRef = useRef<null | HTMLInputElement>(null);

  const [data, loading, error, fetchData] = useFetch(scanRecipt);
  const handleComplateScan = async (scanData: File) => {
    if (scanData.size > 5 * 1024 * 1024) {
      toast.error("file size should be less than 5mb");
      return;
    }
    await fetchData(scanData);
  };

  React.useEffect(() => {
    if (data && !loading) {
      onScanComplete(data);
      console.log("data", data);
      toast.success("Receipt Scanned Successfully");
    }
  }, [data, loading]);
  React.useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(()=>{
    if(fileRef.current?.files?.length){
      handleComplateScan(fileRef.current.files[0]);
    }
  },[fileRef.current])

  return (
    <div>
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept="image/*"
        capture={"environment"}
        onChange={(e)=>{
         if(e.target.files?.[0]){
          handleComplateScan(e.target.files[0])
         }
        }}
      ></input>
      <Button
        disabled={loading}
        onClick={() => fileRef.current?.click() }
        className="w-full animate-gradiant cursor-pointer bg-gradient-to-br from-orange-500 to-purple-500 via-pink-500"
      >
        {loading ? (
          <></>
        ) : (
          <>
            <CameraIcon />
            <span>Scan Receipt </span>
          </>
        )}
      </Button>
    </div>
  );
};

export default Receiptscanner;
