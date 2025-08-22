"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, ArrowLeft, User, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export default function SignoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>

          <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Sign Out
              </CardTitle>
              <CardDescription className="text-center">
                Are you sure you want to sign out?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info Section */}
              {session?.user && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Theme Toggle */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex-1"
                  >
                    System
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoading ? "Signing out..." : "Sign Out"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>You can always sign back in later</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
