"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // Import z twojej instalacji shadcn
import { Loader2 } from "lucide-react"; // Shadcn często używa ikon z lucide-react

interface LoadingButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  isLoading?: boolean;
}

export function LoadingButton({
  children,
  isLoading = false,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={disabled || isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Ładowanie...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
