import Link from "next/link";
import { CrownIcon } from "lucide-react";
import { formatDuration, intervalToDuration } from "date-fns";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface Props {
	points: number;
	msBeforeNext: number;
}

export const Usage = ({ points, msBeforeNext }: Props) => {
	const { has } = useAuth();
	const hasProAccess = has?.({ plan: "pro" });

	const resetTime = useMemo(() => {
		try {
			return formatDuration(
				intervalToDuration({
					start: new Date(),
					end: new Date(Date.now() + msBeforeNext),
				}),
				{ format: ["months", "days", "years"] }
			);
		} catch (error) {
      console.error("Error Formatting Duration ", error)
      return "unknown";
    }
	}, [msBeforeNext]);

	return (
		<div className="rounded-t-xl bg-background border border-b-0 p-2.5">
			<div className="flex items-center gap-x-2">
				<div>
					<p className="text-sm">
						{points} {hasProAccess ? "" : "free"} credits remaining
					</p>
					<p className="text-xs text-muted-foreground">
						Resets in{" "}{resetTime}
					</p>
				</div>
				{!hasProAccess && (
					<Button asChild size="sm" variant="tertiary" className="ml-auto">
						<Link href="/pricing">
							<CrownIcon /> Upgrade
						</Link>
					</Button>
				)}
			</div>
		</div>
	);
};
