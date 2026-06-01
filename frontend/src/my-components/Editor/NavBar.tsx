"use client";
import { Black_Ops_One } from "next/font/google";
import { ChevronDown, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";

const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: ["400"] // choose the weight you need
});

type OnRunProps = {
  onRun: () => void;
  isRunning: boolean;
  userId: string;
  userName: string;
  language: string;
  setLanguage: (language: string) => void;
};

const NavBar = ({
  onRun,
  isRunning,
  userId,
  userName,
  language,
  setLanguage
}: OnRunProps) => {
  const avatarUrl = createAvatar(openPeeps, {
    seed: userId
  }).toDataUri();
  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full  
          h-16 flex bg-black-800 px-6 border-b-2 border-b-primary"
    >
      <div className="flex items-center justify-between w-full h-full">
        {/* ---------------Left-Section-logo------------------------ */}
        <div className="flex items-center justify-center">
          <h1
            className={`${blackOps.className} text-2xl font-bold bg-linear-to-r
             from-purple-500
             via-indigo-600
             to-purple-500
               bg-clip-text 
               text-transparent`}
          >
            DevHive
          </h1>
        </div>
        {/* ---------------Center-Section-ChangeLanguage------------------------ */}
        <div className="flex items-center justify-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="border border-primary rounded-md bg-primary/10 text-primary text-base font-bold hover:bg-violet-300 transition-colors"
            >
              <Button className="flex items-center gap-2 justify-center">
                {language === "javascript" && "JavaScript"}
                {language === "typescript" && "TypeScript"}
                {language === "python" && "Python"}
                {language === "html" && "HTML"}
                {language === "css" && "CSS"}
                {language === "java" && "Java"}
                {language === "react" && "react"}
                <ChevronDown strokeWidth={4} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setLanguage("javascript")}>
                🟨 JavaScript
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage("typescript")}>
                🔷 TypeScript
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage("python")}>
                🐍 Python
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage("html")}>
                🌐 HTML
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage("css")}>
                🎨 CSS
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage("java")}>
                java
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage("react")}>
                react
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={onRun}
            disabled={isRunning}
            className="rounded-md border border-green-700 bg-green-400/10 text-green-700 text-lg font-semibold hover:bg-green-300 transition-colors"
          >
            <Play className="size-4 fill-current" />
            <span className="text-sm">{isRunning ? "Running" : "Run"}</span>
          </Button>
        </div>
        {/* ---------------Right-Section-{Share,Download,Settings,UserAvatar}------------------------ */}
        <div className="flex items-center gap-2 justify-center">
          <Button
            /* className=" bg-linear-to-r from-orange-800 via-orange-600 to-orange-800" */ variant={
              "outline"
            }
          >
            <span className="text-xs">Download Code</span>
            <Download className="size-4" strokeWidth={3} />
          </Button>
          <ModeToggle />

          <div>
            <Avatar className="overflow-visible" size="default">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NavBar;
