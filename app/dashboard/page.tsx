"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, User, Mail, Phone, Edit3, PanelsTopLeft, Sun, Moon, Target, Briefcase, MessageSquare, BarChart, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", domain: "" });
  const DOMAIN_OPTIONS = [
    "AI & Machine Learning",
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "UI/UX Design",
    "Digital Marketing",
    "Business Analytics",
    "Product Management",
    "Sales & Business Development",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center gap-4">
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
             
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
             
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
              <Button variant="outline" onClick={() => {
                setForm({
                  firstName: session.user?.firstName || "",
                  lastName: session.user?.lastName || "",
                  email: session.user?.email || "",
                  phone: session.user?.phone || "",
                  domain: userProfile?.domain || "",
                });
                setEditOpen(true);
              }}>Edit Profile</Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/auth/signout")}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Edit Profile Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your details. Email must be unique.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch("/api/user/profile/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentEmail: session.user?.email, ...form }),
                  });
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err?.error || "Failed to update profile");
                    return;
                  }
                  setEditOpen(false);
                  window.location.reload();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">First Name</label>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Name</label>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Domain</label>
                  <select
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-border bg-background text-foreground"
                  >
                    
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Scrape Drawer */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent side="left" className="w-80 sm:w-96">
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold">Scrape Recommendations</h3>
                  <p className="text-sm text-muted-foreground">Choose what to fetch for your domain</p>
                </div>

                <div className="grid gap-3">
                  <Button onClick={async () => { await fetch("/api/recommendations/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user?.email, domain: userProfile?.domain, category: "courses" }) }); }}>
                    Fetch Courses
                  </Button>
                  <Button onClick={async () => { await fetch("/api/recommendations/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user?.email, domain: userProfile?.domain, category: "hackathons" }) }); }}>
                    Fetch Hackathons
                  </Button>
                  <Button onClick={async () => { await fetch("/api/recommendations/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user?.email, domain: userProfile?.domain, category: "competitions" }) }); }}>
                    Fetch Competitions
                  </Button>
                  <Button onClick={async () => { await fetch("/api/recommendations/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user?.email, domain: userProfile?.domain, category: "internships" }) }); }}>
                    Fetch Internships
                  </Button>
                  <Button onClick={async () => { await fetch("/api/recommendations/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: session.user?.email, domain: userProfile?.domain, category: "jobs" }) }); }}>
                    Fetch Jobs
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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
                icon: <Target className="w-6 h-6 text-blue-600" />,
                status: "Coming Soon",
              },
              {
                title: "Opportunity Hub",
                description: "Discover courses, internships, and projects tailored to your path",
                icon: <Briefcase className="w-6 h-6 text-blue-600" />,
                status: "Coming Soon",
              },
              {
                title: "AI Chatbot Mentor",
                description: "Chat with your AI mentor for personalized advice and guidance",
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                status: "Coming Soon",
              },
              {
                title: "Skill Analytics",
                description: "Track your progress and identify skill gaps",
                icon: <BarChart className="w-6 h-6 text-blue-600" />,
                status: "Coming Soon",
              },
              {
                title: "Trend Insights",
                description: "Stay updated with job market trends and skill demands",
                icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
                status: "Coming Soon",
              },
              {
                title: "Community",
                description: "Connect with peers and mentors in your field",
                icon: <Users className="w-6 h-6 text-blue-600" />,
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
                    <div className="mb-4">{feature.icon}</div>
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
