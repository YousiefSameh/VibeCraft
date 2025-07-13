"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import UserControl from "@/components/ui/user-control";
import { cn } from "@/lib/utils";

const Navbar = () => {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 0) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={cn(
				"p-4 fixed top-0 left-0 right-0 z-50 w-screen transition-all duration-200 border-b",
				scrolled
					? "bg-background border-border"
					: "bg-transparent border-transparent"
			)}
		>
			<div className="max-w-5xl mx-auto w-full flex justify-between items-center">
				<Link href="/" className="flex items-center gap-2">
					<Image src="/logo.svg" alt="VibeCraft Logo" width={24} height={24} />
					<span className="font-semibold text-lg">VibeCraft</span>
				</Link>
				<SignedOut>
					<div className="flex gap-2">
						<SignInButton>
							<Button variant="outline" size="sm">
								Sign In
							</Button>
						</SignInButton>
						<SignUpButton>
							<Button variant="default" size="sm">
								Sign Up
							</Button>
						</SignUpButton>
					</div>
				</SignedOut>
				<SignedIn>
					<UserControl showName />
				</SignedIn>
			</div>
		</nav>
	);
};

export default Navbar;
