"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Usage } from "./Usage";
import { useRouter } from "next/navigation";

interface Props {
	projectId: string;
}

const formSchema = z.object({
	value: z
		.string()
		.min(1, { message: "Message Is Required" })
		.max(10000, { message: "Message Is Too Long" }),
});

type formSchemaType = z.infer<typeof formSchema>;

export const MessageForm = ({ projectId }: Props) => {
	const router = useRouter();
	const trpc = useTRPC();
  const queryClient = useQueryClient();
	const { data: usage } = useQuery(trpc.usage.status.queryOptions());
	const [isFocused, setIsfocused] = useState(false);
	const showUsage = !!usage;
	const form = useForm<formSchemaType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			value: "",
		},
	});


	const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries(
        trpc.messages.getMany.queryOptions({ projectId })
      );
			queryClient.invalidateQueries(
				trpc.usage.status.queryOptions()
			);
    },
    onError: (error) => {
      toast.error(error.message);

			if (error.data?.code === "TOO_MANY_REQUESTS") {
				router.push("/pricing");
			}
    }
  }));

	const onSubmit = async (values: formSchemaType) => {
		await createMessage.mutateAsync({
			value: values.value,
			projectId,
		});
	};

	const { isPending } = createMessage;
	const isButtonDisabled = isPending || !form.formState.isValid;

	return (
		<Form {...form}>
			{ showUsage && (
				<Usage points={usage.remainingPoints} msBeforeNext={usage.msBeforeNext} />
			) }
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn(
					"relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
					isFocused && "shadow-xs",
					showUsage && "rounded-t-none"
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
		</Form>
	);
};
