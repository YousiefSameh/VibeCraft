"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constants";

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message Is Required" })
    .max(10000, { message: "Message Is Too Long" }),
});

type formSchemaType = z.infer<typeof formSchema>;

export const ProjectForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isFocused, setIsfocused] = useState(false);
  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      queryClient.invalidateQueries(
        trpc.projects.getMany.queryOptions()
      );
      queryClient.invalidateQueries(
				trpc.usage.status.queryOptions()
			);
      router.push(`/projects/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
			if (error.data?.code === "TOO_MANY_REQUESTS") {
				router.push("/pricing");
			}
    }
  }));

  const onSubmit = async (values: formSchemaType) => {
    await createProject.mutateAsync({
      value: values.value,
    });
  };

  const onSelect = (content: string) => {
    form.setValue("value", content, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }

  const { isPending } = createProject;
  const isButtonDisabled = isPending || !form.formState.isValid;

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
            isFocused && "shadow-xs",
          )}
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsfocused(true)}
                onBlur={() => setIsfocused(false)}
                minRows={2}
                maxRows={8}
                className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                placeholder="What would you like to build?"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
              />
            )}
          />
          <div className="flex gap-x-2 items-end justify-between pt-2">
            <div className="text-[10px] text-muted-foreground font-mono">
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none gap-1 rounded border bg-muted p-1 font-mono text-[10px] font-medium text-muted-foreground">
                <span>&#8984;</span> Enter
              </kbd>
              &nbsp;to submit
            </div>
            <Button
              disabled={isButtonDisabled}
              className={cn(
                "size-8 rounded-full",
                isButtonDisabled && "bg-muted-foreground"
              )}
            >
              {isPending ? <Loader2Icon /> : <ArrowUpIcon />}
            </Button>
          </div>
        </form>
        <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
          {PROJECT_TEMPLATES.map((template, index) => (
            <Button key={index} variant="outline" size="sm" className="bg-white dark:bg-sidebar" onClick={() => onSelect(template.prompt)}>
              {template.emoji} {template.title}
            </Button>
          ))}
        </div>
      </section>
    </Form>
  );
};
