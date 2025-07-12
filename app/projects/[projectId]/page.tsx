import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import ProjectView from "@/modules/projects/ui/views/ProjectView";
import { Suspense } from "react";

interface Props {
  params: Promise<{ projectId: string }>
}

const SingleProjectPage = async ({ params }: Props) => {
  const { projectId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
    projectId,
  }))
  void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
    projectId,
  }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  )
}

export default SingleProjectPage