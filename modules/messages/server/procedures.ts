import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messageRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z.object({
				projectId: z.string().min(1, { message: "Project Id Is Required" }),
			})
		)
		.query(async ({ input, ctx }) => {
			const messages = await prisma.message.findMany({
				where: {
					projectId: input.projectId,
					project: {
						userId: ctx.auth.userId,
					},
				},
				include: { fragment: true },
				orderBy: {
					updatedAt: "asc",
				},
			});
			return messages;
		}),
	create: protectedProcedure
		.input(
			z.object({
				value: z
					.string()
					.min(1, { message: "Message Is Required" })
					.max(10000, { message: "Message Is Too Long" }),
				projectId: z.string().min(1, { message: "Project Id Is Required" }),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const existingProject = await prisma.project.findUnique({
				where: { id: input.projectId, userId: ctx.auth.userId },
			});

			if (!existingProject) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Project Not Found" });
			}

			try {
				await consumeCredits()
			} catch (error) {
				if (error instanceof Error) {
					throw new TRPCError({ code: "BAD_REQUEST", message: "Something went error" });
				} else {
					throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You have run out of credits" })
				}
			}

			const createdMessage = await prisma.message.create({
				data: {
					projectId: existingProject.id,
					content: input.value,
					role: "USER",
					type: "RESULT",
				},
			});
			await inngest.send({
				name: "code-agent/run",
				data: {
					value: input.value,
					projectId: input.projectId,
				},
			});
			return createdMessage;
		}),
});
