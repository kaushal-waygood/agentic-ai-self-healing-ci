"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({ text = "Back to Search" }: { text?: string }) {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.back()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      {text}
    </Button>
  );
}
