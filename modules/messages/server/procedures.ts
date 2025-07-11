import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const messageRouter = createTRPCRouter({
  getMany: baseProcedure
    .query(async () => {
      const messages = await prisma.message.findMany({
        orderBy: {
          updatedAt: "asc"
        }
      })
      return messages;
    }),
	create: baseProcedure
		.input(
			z.object({
				value: z.string().min(1, { message: "Message Is Required" }).max(10000, { message: "Message Is Too Long" }),
				projectId: z.string().min(1, { message: "Project Id Is Required" })
			})
		)
		.mutation(async ({ input }) => {
			const createdMessage = await prisma.message.create({
				data: {
					projectId: input.projectId,
					content: input.value,
					role: "USER",
					type: "RESULT",
				},
			});
			await inngest.send({
				name: "code-agent/run",
				data: {
					value: input.value,
					projectId: input.projectId
				},
			});
      return createdMessage;
		}),
});
