"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import MessageCard from "./MessageCard";
import { Fragment } from "@/lib/generated/prisma";
import { MessageForm } from "./MessageForm";
import MessageLoader from "./MessageLoader";

interface Props {
	projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessageContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {
	const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);
	const { data: messages } = useSuspenseQuery(
		trpc.messages.getMany.queryOptions({
			projectId,
		}, {
      refetchInterval: 5000,
    })
	);

  useEffect(() => {
    const lastAssistantMessage = messages.findLast((message) => message.role === "ASSISTANT" && !!message.fragment)
    if (lastAssistantMessage?.fragment && lastAssistantMessage?.id !== lastAssistantMessageIdRef.current) {
      setActiveFragment(lastAssistantMessage.fragment);
      lastAssistantMessageIdRef.current = lastAssistantMessage.id;
    }
  }, [messages, setActiveFragment])

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "USER";

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
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragemntClick={() => setActiveFragment(message.fragment)}
            />
          ))}
          {isLastMessageUser && <MessageLoader />}
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
