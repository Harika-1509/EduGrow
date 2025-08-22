"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, User, Mail, Phone, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check onboarding status from session
      if (!session.user.onboarding) {
        router.push("/onboarding");
        return;
      }
      
      // Set user profile from session data
      setUserProfile({
        onboarding: session.user.onboarding,
        domain: session.user.domain,
        onboardingData: session.user.onboardingData
      });
      setIsLoading(false);
    }
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome to CareerPath</h1>
              <p className="text-muted-foreground">
                Your AI-powered career mentor dashboard
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/signout")}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </Label>
                  <p className="text-lg font-medium">
                    {session.user?.firstName} {session.user?.lastName}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-lg font-medium">{session.user?.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <p className="text-lg font-medium">{session.user?.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </Label>
                  <Badge variant="secondary" className="text-sm">
                    Active
                  </Badge>
                </div>
                {userProfile?.domain && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Career Domain
                    </Label>
                    <Badge variant="default" className="text-sm">
                      {userProfile.domain}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Summary */}
          {userProfile?.onboardingData && (
            <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      🎯 Career Profile Summary
                    </CardTitle>
                    <CardDescription>
                      Your personalized career preferences and goals
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/onboarding")}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile.domain && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Primary Career Domain
                    </Label>
                    <Badge variant="default" className="text-sm">
                      {userProfile.domain}
                    </Badge>
                  </div>
                )}
                
                {userProfile.onboardingData.personalBackground?.education && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Education Level
                    </Label>
                    <p className="text-sm">{userProfile.onboardingData.personalBackground.education}</p>
                  </div>
                )}
                
                {userProfile.onboardingData.goals?.motivation && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Career Motivation
                    </Label>
                    <p className="text-sm">{userProfile.onboardingData.goals.motivation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI Career Roadmap",
                description: "Get personalized career guidance based on your skills and interests",
                icon: "🎯",
                status: "Coming Soon",
              },
              {
                title: "Opportunity Hub",
                description: "Discover courses, internships, and projects tailored to your path",
                icon: "💼",
                status: "Coming Soon",
              },
              {
                title: "AI Chatbot Mentor",
                description: "Chat with your AI mentor for personalized advice and guidance",
                icon: "🤖",
                status: "Coming Soon",
              },
              {
                title: "Skill Analytics",
                description: "Track your progress and identify skill gaps",
                icon: "📊",
                status: "Coming Soon",
              },
              {
                title: "Trend Insights",
                description: "Stay updated with job market trends and skill demands",
                icon: "📈",
                status: "Coming Soon",
              },
              {
                title: "Community",
                description: "Connect with peers and mentors in your field",
                icon: "👥",
                status: "Coming Soon",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper component for labels
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
