"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HintProps {
  children: React.ReactNode;
  text: string;
  side?: "top" | "left" | "bottom" | "right";
  align?: "start" | "center" | "end";
}

const Hint = ({ children, text, side = "top", align = "center" }: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}><p>{text}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default Hint