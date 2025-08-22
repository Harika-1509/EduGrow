"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  showThemeToggle?: boolean;
  showSignOut?: boolean;
  showEditProfile?: boolean;
  onEditProfile?: () => void;
  children?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  backUrl = "/dashboard",
  showThemeToggle = true,
  showSignOut = true,
  showEditProfile = false,
  onEditProfile,
  children
}: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-4 sm:py-6 lg:py-8">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        )}
        
        <div className="flex items-center gap-2 font-bold">
          <Image
            key={mounted ? theme : 'loading'}
            src={mounted && theme === 'dark' ? "/main-logo-dark.png" : "/main-logo.png"}
            alt="CareerPath Logo"
            width={150}
            height={150}
            className="rounded-lg"
          />
        </div>

        {(title || subtitle) && (
          <div>
            {title && <h1 className="text-3xl font-bold">{title}</h1>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {children}
        
        {showThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            title="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}

        {showEditProfile && onEditProfile && (
          <Button variant="outline" onClick={onEditProfile}>
            Edit Profile
          </Button>
        )}
        
        {showSignOut && (
          <Button
            variant="outline"
            onClick={() => router.push("/auth/signout")}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}
