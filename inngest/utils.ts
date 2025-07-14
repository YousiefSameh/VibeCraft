import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import { SANDBOX_TIMEOUT } from "./types";

export const getSandbox = async (sandboxId: string) => {
	const getSandboxId = await sandboxId;
	const sandbox = await Sandbox.connect(getSandboxId);
	await sandbox.setTimeout(SANDBOX_TIMEOUT);
	return sandbox;
};

export const lastAssistantTextMessageContent = (result: AgentResult) => {
	const lastAssistantTextMessageIndex = result.output.findLastIndex(
		(message) => message.role === "assistant"
	);
	const message = result.output[lastAssistantTextMessageIndex] as
		| TextMessage
		| undefined;

	return message?.content
		? typeof message.content === "string"
			? message.content
			: message.content.map((c) => c.text).join("")
		: undefined;
};

export const parseAgentOutput = (value: Message[]) => {
	const output = value[0];

	if (output.type !== "text") {
		return "Here you go";
	}

	if (Array.isArray(output.content)) {
		return output.content.map((txt) => txt).join("");
	} else {
		return output.content;
	}
};
