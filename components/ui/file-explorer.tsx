import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import Hint from "./hint";
import { Button } from "./button";
import { CodeView } from "../code-view";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./resizable";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "./breadcrumb";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";


type FileCollection = { [path: string]: string };

const getLanguageFromExtension = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
}

const FileBreadcrumb = ({ filePath }: { filePath: string }) => {
  const pathSegmants = filePath.split("/");
  const maxSegmants = 4;

  const renderBreadcrumbsItems = () => {
    if (pathSegmants.length <= maxSegmants)  {
      // Show All Segmants If 4 Or Less
      return pathSegmants.map((segmant, index) => {
        const isLast = index === pathSegmants.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segmant}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-fragment">{segmant}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        )
      })
    } else {
      const firstSegmant = pathSegmants[0];
      const lastSegmant = pathSegmants[pathSegmants.length - 1];

      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegmant}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {lastSegmant}
            </BreadcrumbPage>
          </BreadcrumbItem>

        </>
      )
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {renderBreadcrumbsItems()}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const FileExplorer = ({ files }: { files: FileCollection }) => {
  const [ copied, setCopied ] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handleFileSelect = useCallback((filePath: string) => {
    if (files[filePath]) setSelectedFile(filePath);
  }, [files])

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors"/>
      <ResizablePanel defaultSize={70} minSize={50}>
        { selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex items-center justify-between gap-x-2">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text="Copy to clipboard" side="bottom">
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  { copied ? <CopyCheckIcon /> : <CopyIcon /> }
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView code={files[selectedFile]} lang={getLanguageFromExtension(selectedFile)} />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view it&apos;s Content
          </div>
        ) }
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}