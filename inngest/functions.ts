import {
	openai,
	createAgent,
	createTool,
	createNetwork,
	Message,
	createState,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox, lastAssistantTextMessageContent, parseAgentOutput } from "./utils";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { z } from "zod";
import prisma from "@/lib/prisma";

interface AgentState {
	summary: string;
	files: { [path: string]: string };
}

export const codeAgent = inngest.createFunction(
	{ id: "code-agent" },
	{ event: "code-agent/run" },
	async ({ event, step }) => {
		let sandboxUrl: string | null = null;
		try {
			const sandboxId = await step.run("create-sandbox", async () => {
				const sandbox = await Sandbox.create("vibecraft-nextjs-yousiefsameh");
				return sandbox.sandboxId;
			});

			const perviousMessages = await step.run(
				"get-previous-messages",
				async () => {
					const formattedMessages: Message[] = [];
					const messages = await prisma.message.findMany({
						where: {
							projectId: event.data.projectId,
						},
						orderBy: {
							createdAt: "desc",
						},
					});
					for (const message of messages) {
						formattedMessages.push({
							type: "text",
							role: message.role === "ASSISTANT" ? "assistant" : "user",
							content: message.content,
						});
					}
					return formattedMessages;
				}
			);

			const state = createState<AgentState>(
				{
					summary: "",
					files: {},
				},
				{
					messages: perviousMessages,
				}
			);

			const model = openai({
				model: "gpt-4.1",
				baseUrl: "https://models.github.ai/inference",
				apiKey: process.env.OPENAI_API_KEY!,
			});

			const codeAgent = createAgent<AgentState>({
				name: "code-agent",
				system: PROMPT,
				model,
				tools: [
					// terminal use
					createTool({
						name: "terminal",
						description: "Use the terminal to run commands",
						parameters: z.object({
							command: z.string(),
						}),
						handler: async ({ command }) => {
							console.log("terminal < ", command);
							const buffers = { stdout: "", stderr: "" };

							try {
								const sandbox = await getSandbox(sandboxId);
								const result = await sandbox.commands.run(command, {
									onStdout: (data: string) => {
										buffers.stdout += data;
									},
									onStderr: (data: string) => {
										buffers.stderr += data;
									},
								});
								console.log("terminal result >", result.stdout);
								return result.stdout;
							} catch (e) {
								console.error(
									`Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
								);
								return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
							}
						},
					}),
					// create or update file
					createTool({
						name: "createOrUpdateFiles",
						description: "Create or update files in the sandbox",
						parameters: z.object({
							files: z.array(
								z.object({
									path: z.string(),
									content: z.string(),
								})
							),
						}),
						handler: async ({ files }, context) => {
							console.log(
								"createOrUpdateFiles <",
								files.map((f) => f.path)
							);
							try {
								const sandbox = await getSandbox(sandboxId);
								for (const file of files) {
									await sandbox.files.write(file.path, file.content);
								}

								if (context?.network) {
									context.network.state.data.files = {
										...(context.network.state.data.files || {}),
										...Object.fromEntries(
											files.map((f) => [f.path, f.content])
										),
									};
								}

								return `Files created/updated: ${files
									.map((f) => f.path)
									.join(", ")}`;
							} catch (e) {
								console.error("error", e);
								return "Error: " + e;
							}
						},
					}),
					// read files
					createTool({
						name: "readFiles",
						description: "Read files from the sandbox",
						parameters: z.object({
							files: z.array(z.string()),
						}),
						handler: async ({ files }) => {
							console.log("readFiles <", files);
							try {
								const sandbox = await getSandbox(sandboxId);
								const contents = [];
								for (const file of files) {
									const content = await sandbox.files.read(file);
									contents.push({ path: file, content });
								}
								return JSON.stringify(contents);
							} catch (e) {
								console.error("error", e);
								return "Error: " + e;
							}
						},
					}),
				],
				lifecycle: {
					onResponse: async ({ result, network }) => {
						const txt = await lastAssistantTextMessageContent(result);
						if (txt?.includes("<task_summary>") && network) {
							network.state.data.summary = txt;
						}
						return result;
					},
				},
			});

			const network = createNetwork<AgentState>({
				name: "coding-agent-network",
				agents: [codeAgent],
				defaultState: state,
				maxIter: 15,
				router: async ({ network }) =>
					network.state.data.summary ? undefined : codeAgent,
			});

			const result = await network.run(event.data.value, { state });

			const fragmentTitleGenerator = createAgent<AgentState>({
				name: "fragment-title",
				system: FRAGMENT_TITLE_PROMPT,
				model: openai({
					model: "gpt-4o",
					baseUrl: "https://models.github.ai/inference",
					apiKey: process.env.OPENAI_API_KEY!,
				}),
			});

			const responseGenerator = createAgent<AgentState>({
				name: "response-generator",
				system: RESPONSE_PROMPT,
				model: openai({
					model: "gpt-4o",
					baseUrl: "https://models.github.ai/inference",
					apiKey: process.env.OPENAI_API_KEY!,
				}),
			});

			const { output: fragmentTitle } = await fragmentTitleGenerator.run(result.state.data.summary);
			const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);

			const isError =
				!result.state.data.summary ||
				Object.keys(result.state.data.files || {}).length === 0;

			if (!isError) {
				sandboxUrl = await step.run("get-sandbox-url", async () => {
					const sandbox = await getSandbox(sandboxId!);
					const host = sandbox.getHost(3000);
					return `https://${host}`;
				});
			}

			await step.run("save-result", async () => {
				if (isError) {
					return await prisma.message.create({
						data: {
							projectId: event.data.projectId,
							content: "Agent execution failed to produce valid output",
							role: "ASSISTANT",
							type: "ERROR",
						},
					});
				}

				return await prisma.message.create({
					data: {
						projectId: event.data.projectId,
						content: parseAgentOutput(responseOutput),
						role: "ASSISTANT",
						type: "RESULT",
						fragment: {
							create: {
								title: parseAgentOutput(fragmentTitle),
								sandboxUrl: sandboxUrl!,
								files: result.state.data.files,
							},
						},
					},
				});
			});

			return {
				url: sandboxUrl,
				title: "Fragment",
				files: result.state.data.files || {},
				summary: result.state.data.summary || "",
			};
		} catch (error) {
			console.error("Agent execution error:", error);

			await step.run("save-error", async () => {
				return await prisma.message.create({
					data: {
						projectId: event.data.projectId,
						content: `Agent failed: ${(error as Error).message}`,
						role: "ASSISTANT",
						type: "ERROR",
					},
				});
			});

			return {
				error: (error as Error).message,
			};
		}
	}
);
