import {
	openai,
	createAgent,
	createTool,
	createNetwork,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const codeAgent = inngest.createFunction(
	{ id: "code-agent" },
	{ event: "code-agent/run" },
	async ({ event, step }) => {
		let sandboxUrl: string | null = null;
		try {
			// Create sandbox with explicit ID assignment
			const sandboxId = await step.run("create-sandbox", async () => {
				const sandbox = await Sandbox.create("vibecraft-nextjs-yousiefsameh");
				return sandbox.sandboxId;
			});

			const model = openai({
				model: "gpt-4o",
				baseUrl: "https://models.github.ai/inference",
				apiKey: process.env.OPENAI_API_KEY!,
			});

			const codeAgent = createAgent({
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

			const network = createNetwork({
				name: "coding-agent-network",
				agents: [codeAgent],
				defaultModel: model,
				maxIter: 15,
				router: async ({ network }) =>
					network.state.data.summary ? undefined : codeAgent,
			});

			const result = await network.run(event.data.value);
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
							content: "Agent execution failed to produce valid output",
							role: "ASSISTANT",
							type: "ERROR",
						},
					});
				}

				return await prisma.message.create({
					data: {
						content: result.state.data.summary,
						role: "ASSISTANT",
						type: "RESULT",
						fragment: {
							create: {
								title: "Fragment",
								sandboxUrl: sandboxUrl!,
								files: result.state.data.files || {},
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
