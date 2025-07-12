"use client";

import { Suspense, useState } from "react";
import { Fragment } from "@/lib/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessageContainer } from "../components/MessageContainer";
import ProjectHeader from "../components/ProjectHeader";
import FragmentWeb from "../components/FragmentWeb";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/ui/file-explorer";

interface Props {
	projectId: string;
}

const ProjectView = ({ projectId }: Props) => {
  const [ activeFragment, setActiveFragment ] = useState<Fragment | null>(null);
  const [ tabState, setTabState ] = useState<"preview" | "code">("preview");
	
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
          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as "preview" | "code" )}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList>
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon /> <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button size="sm" variant="default">
                  <Link href="/pricing" className="flex items-center gap-2">
                    <CrownIcon /> Upgrade
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview">
              { activeFragment && <FragmentWeb data={activeFragment} /> }
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              {!!activeFragment?.files && (
                <FileExplorer files={activeFragment.files as { [path: string]: string }} />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
		</div>
	);
};

export default ProjectView;
