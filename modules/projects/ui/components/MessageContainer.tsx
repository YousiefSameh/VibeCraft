"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import MessageCard from "./MessageCard";
import { Fragment } from "@/lib/generated/prisma";
import { MessageForm } from "./MessageForm";

interface Props {
	projectId: string;
}

export const MessageContainer = ({ projectId }: Props) => {
	const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
	const { data: messages } = useSuspenseQuery(
		trpc.messages.getMany.queryOptions({
			projectId,
		})
	);

  useEffect(() => {
    const lastAssistantMessage = messages.findLast((message) => message.role === "ASSISTANT")
    if (lastAssistantMessage) {
      // TODO: Set Active Fragment
    }
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length])

	return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              fragment={message.fragment}
              role={message.role}
              type={message.type}
              createdAt={message.createdAt}
              isActiveFragment={false}
              onFragemntClick={(fragment: Fragment) => {return fragment}}
            />
          ))}
          <div ref={bottomRef}/>
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradiant-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
