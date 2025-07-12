"use client";

import { Suspense, useState } from "react";
import { Fragment } from "@/lib/generated/prisma";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessageContainer } from "../components/MessageContainer";
import ProjectHeader from "../components/ProjectHeader";

interface Props {
	projectId: string;
}

const ProjectView = ({ projectId }: Props) => {
  const [ activeFragment, setActiveFragment ] = useState<Fragment | null>(null);

	
	return (
		<div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<p>Loading Messages ...</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<p>Loading Messages ...</p>}>
            <MessageContainer projectId={projectId} activeFragment={activeFragment} setActiveFragment={setActiveFragment}/>
          </Suspense>
          
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
        >
          TODO: Preview
        </ResizablePanel>
      </ResizablePanelGroup>
		</div>
	);
};

export default ProjectView;
