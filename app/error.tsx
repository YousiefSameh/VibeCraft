"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
	error: Error;
	reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  const router = useRouter();
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-background">
			<div className="max-w-2xl w-full mx-auto p-8 flex flex-col items-center gap-6 text-center">
				<div className="w-24 h-24 relative rounded-2xl bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
					<Image
						src="/logo.svg"
						alt="VibeCraft Logo"
						width={48}
						height={48}
						className="opacity-75"
					/>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
						Something went wrong
					</h1>
					<p className="text-gray-500 dark:text-gray-400 max-w-md">
						We apologize for the inconvenience. An unexpected error has
						occurred. Our team has been notified and is working to resolve the
						issue.
					</p>
				</div>

				<div className="flex gap-4">
					<Button
						variant="default"
						onClick={reset}
					>
						Try Again
					</Button>
					<Button
						variant="outline"
						onClick={() => router.replace('/')}
					>
						Go Home
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;
