import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface TooltipButtonProps {
  children: React.ReactNode;
  tip: string;
  className?: string;
}

function TooltipWrap(props: TooltipButtonProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger className={props.className}>
          {props.children}
        </TooltipTrigger>
        <TooltipContent>
          <span>{props.tip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TooltipWrap;
