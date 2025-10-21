
"use client"
import React from 'react'
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";


const BackButton = () => {
    const router = useRouter();

    return (
        <button onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-1.5 rounded bg-[#FAE9EC] hover:bg-[#ffd7dd] transition-all duration-300 ease-in-out m-4 my-6 lg:my-0 cursor-pointer"
            
        >
            <ChevronLeft className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">Back</span>
        </button>
    )
}

export default BackButton