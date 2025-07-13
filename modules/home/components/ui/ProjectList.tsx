"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { useUser } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectList = () => {
	const { user } = useUser();
	const trpc = useTRPC();
	const { data: projects, isLoading } = useQuery(
		trpc.projects.getMany.queryOptions()
	);

	if (!user) return null;

	return (
		<div className="w-full bg-white dark:bg-background rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
			<h2 className="text-2xl font-semibold">{user?.fullName}&apos;s Vibes</h2>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
				{isLoading && (
					<>
						<Skeleton className="h-[88px] w-full" />
						<Skeleton className="h-[88px] w-full" />
						<Skeleton className="h-[88px] w-full" />
					</>
				)}
				{!isLoading && projects?.length === 0 && (
					<div className="col-span-full text-center">
						<p className="text-sm text-muted-foreground">No Projects Found</p>
					</div>
				)}
				{!isLoading &&
					projects?.map((project) => (
						<Button
							key={project.id}
							variant="outline"
							className="font-normal h-auto justify-start w-full text-start p-4"
							asChild
						>
							<Link href={`/projects/${project.id}`}>
								<div className="flex items-center gap-x-4">
									<Image
										src="/logo.svg"
										alt="VibeCraft Logo"
										width={32}
										height={32}
										className="object-contain"
									/>
									<div className="flex flex-col">
										<h3 className="truncate font-medium">{project.name}</h3>
										<p className="text-sm text-muted-foreground">
											{formatDistanceToNow(project.updatedAt, {
												addSuffix: true,
											})}
										</p>
									</div>
								</div>
							</Link>
						</Button>
					))}
			</div>
		</div>
	);
};

export default ProjectList;
