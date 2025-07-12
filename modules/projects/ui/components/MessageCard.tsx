import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

interface FragmentCardProps {
	fragment: Fragment;
	isActiveFragment: boolean;
	onFragemntClick: (fragment: Fragment) => void;
}

const FragmentCard = ({ fragment, isActiveFragment, onFragemntClick }: FragmentCardProps) => {
	return (
		<button onClick={() => onFragemntClick(fragment)} className={cn(
			"flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
			isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary"
		)}>
			<Code2Icon className="size-4 mt-0.5" />
			<div className="flex flex-col flex-1">
				<span className="text-sm font-medium line-clamp-0">{fragment.title}</span>
				<span className="text-sm">Preview</span>
			</div>
			<div className="flex items-center justify-center mt-0.5">
				<ChevronRightIcon className="size-4" />
			</div>
		</button>
	)
}

interface AssistantMessageProps {
	content: string;
	fragment: Fragment | null;
	type: MessageType;
	createdAt: Date;
	isActiveFragment: boolean;
	onFragemntClick: (fragment: Fragment) => void;
}

const AssistantMessage = ({
	content,
	fragment,
	type,
	createdAt,
	isActiveFragment,
	onFragemntClick,
}: AssistantMessageProps) => {
	return (
		<div
			className={cn(
				"flex flex-col group justify-end pb-4 pr-2 pl-10",
				type === "ERROR" && "text-red-700 dark:text-red-500"
			)}
		>
			<div className="flex items-center gap-2 pl-2 mb-2">
				<Image
					src="/logo.svg"
					alt="VibeCraft Logo"
					width={20}
					height={20}
					className="shrink-0"
				/>
				<span className="text-sm font-medium">VibeCraft</span>
				<span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
					{format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
				</span>
			</div>
			<div className="pl-8.5 flex flex-col gap-y-4">
				<span>{content}</span>
				{ fragment && type === "RESULT" && (
					<FragmentCard
						fragment={fragment}
						isActiveFragment={isActiveFragment}
						onFragemntClick={onFragemntClick}
					/>
				) }
			</div>
		</div>
	);
};

interface UserMessageProps {
	content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
	return (
		<div className="flex justify-end pb-4 pr-2 pl-10">
			<Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
				{content}
			</Card>
		</div>
	);
};

interface Props {
	content: string;
	fragment: Fragment | null;
	role: MessageRole;
	type: MessageType;
	createdAt: Date;
	isActiveFragment: boolean;
	onFragemntClick: (fragment: Fragment) => void;
}

const MessageCard = ({
	content,
	fragment,
	role,
	type,
	createdAt,
	isActiveFragment,
	onFragemntClick,
}: Props) => {
	if (role === "ASSISTANT") {
		return (
			<AssistantMessage
				content={content}
				fragment={fragment}
				type={type}
				createdAt={createdAt}
				isActiveFragment={isActiveFragment}
				onFragemntClick={onFragemntClick}
			/>
		);
	}

	return <UserMessage content={content} />;
};

export default MessageCard;
