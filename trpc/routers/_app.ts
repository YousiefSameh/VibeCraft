import { createTRPCRouter } from '../init';
import { messageRouter } from '@/modules/messages/server/procedures';
import { projectRouter } from '@/modules/projects/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedures';

export const appRouter = createTRPCRouter({
  messages: messageRouter,
  projects: projectRouter,
  usage: usageRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;