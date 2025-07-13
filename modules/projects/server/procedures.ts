import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectRouter = createTRPCRouter({
	getOne: protectedProcedure
		.input(
			z.object({
				projectId: z.string().min(1, { message: "Project ID is required" }),
			})
		)
		.query(async ({ input, ctx }) => {
			const existingProject = await prisma.project.findUnique({
				where: { id: input.projectId, userId: ctx.auth.userId },
			});

			if (!existingProject) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return existingProject;
		}),
	getMany: protectedProcedure.query(async ({ ctx }) => {
		const projects = await prisma.project.findMany({
			where: {
				userId: ctx.auth.userId,
			},
			orderBy: {
				updatedAt: "asc",
			},
		});
		return projects;
	}),
	create: protectedProcedure
		.input(
			z.object({
				value: z
					.string()
					.min(1, { message: "Message Is Required" })
					.max(10000, { message: "Message Is Too Long" }),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				await consumeCredits();
			} catch (error) {
				if (error instanceof Error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Something went error",
					});
				} else {
					throw new TRPCError({
						code: "TOO_MANY_REQUESTS",
						message: "You have run out of credits",
					});
				}
			}

			const createdProject = await prisma.project.create({
				data: {
					userId: ctx.auth.userId,
					name: generateSlug(2, {
						format: "kebab",
					}),
					messages: {
						create: {
							content: input.value,
							role: "USER",
							type: "RESULT",
						},
					},
				},
			});
			await inngest.send({
				name: "code-agent/run",
				data: {
					value: input.value,
					projectId: createdProject.id,
				},
			});
			return createdProject;
		}),
});
