"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  text: string;
  className?: string;
}

export function SubmitButton({ text, className }: Readonly<SubmitButtonProps>) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={status.pending}
      disabled={status.pending}
      className={cn(className, status.pending ? "animate-pulse" : "")}
    >
      {status.pending ? "Mengirim" : text}
    </Button>
  );
}
