import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs";

export const projectRouter = createTRPCRouter({
	getMany: baseProcedure.query(async () => {
		const projects = await prisma.project.findMany({
			orderBy: {
				updatedAt: "asc",
			},
		});
		return projects;
	}),
	create: baseProcedure
		.input(
			z.object({
				value: z.string().min(1, { message: "Message Is Required" }).max(10000, { message: "Message Is Too Long" }),
			})
		)
		.mutation(async ({ input }) => {
			const createdProject = await prisma.project.create({
				data: {
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
					projectId: createdProject.id
				},
			});
			return createdProject;
		}),
});
