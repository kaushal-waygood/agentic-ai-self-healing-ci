
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, UserCircle, LogIn, Settings as SettingsIcon, ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { mockHeaderData } from "@/lib/data/header";
import { mockUserProfile, initialUserProfile } from "@/lib/data/user"; 
import { useState, useEffect } from "react";

export function SiteHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs on the client, so it correctly reflects the initial state
    // and subsequent changes during the user's session.
    setIsAuthenticated(!!mockUserProfile.email);
    setIsClient(true);
  }, []); // Re-checking auth state isn't strictly necessary here unless mockUserProfile can change without a re-render.
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-bold inline-block">CareerPilot</span>
        </Link>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex gap-1">
            {mockHeaderData.map((item) =>
              item.children && item.children.length > 0 ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1">
                      {item.title}
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.id} asChild>
                        <Link href={child.href || "#"}>{child.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button key={item.id} variant="ghost" asChild>
                  <Link href={item.href || "#"}>{item.title}</Link>
                </Button>
              )
            )}
          </nav>
          <div className="flex items-center space-x-2">
            {isClient && (
              <>
                {isAuthenticated ? (
                  <UserNav />
                ) : (
                  <Button asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const user = mockUserProfile;

  const handleLogout = () => {
    // Reset the mock user profile to its initial, logged-out state
    Object.assign(mockUserProfile, {
      ...initialUserProfile,
    });

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/100x100.png" alt={user.fullName} data-ai-hint="user avatar" />
            <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <UserCircle className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
