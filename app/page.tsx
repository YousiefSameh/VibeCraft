"use client";

"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const HomePage = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      router.push(`/projects/${data.id}`)
    },
    onError: () => {
      toast.error("Something Went Wrong")
    }
  }))
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
        <Input value={value} onChange={(e) => setValue(e.target.value)}/>
        <Button disabled={createProject.isPending} onClick={() => createProject.mutate({ value })}>Send a Prompt</Button>
      </div>
    </div>
  )
}

export default HomePage