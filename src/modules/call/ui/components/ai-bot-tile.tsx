"use client";

import Image from "next/image";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  speaking: boolean;
  name: string;
  image:string
}

export const AIBotTile = ({ speaking, name ,image}: Props) => {
  const safeImage = image.trim();
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(
    safeImage
  )}`;
console.log(speaking)
  return (
    <div
      className={cn(
        "absolute bottom-6 right-6 w-48 h-48 rounded-xl z-50",
        "bg-gradient-to-br from-emerald-500/20 to-emerald-900/40",
        "border border-emerald-500 shadow-xl flex flex-col items-center justify-center",
        speaking && "ring-2 ring-emerald-400 animate-pulse"
      )}
    >
      <Image
        src={avatarUrl}
        alt={name}
        width={72}
        height={72}
        unoptimized
      />

      <span className="absolute bottom-6 right-6 bg-emerald-600 p-1 rounded-full">
        <Bot size={14} className="text-white" />
      </span>

      <p className="mt-2 text-sm font-semibold text-white">
        {name}
      </p>

      {speaking && (
        <span className="text-[10px] text-emerald-300 mt-1">
          Speaking…
        </span>
      )}
    </div>
  );
};
