"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { User, Mail, Phone, Edit3, Target, Briefcase, MessageSquare, BarChart, TrendingUp, Users, LogOut, UserCircle, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  // Check for edit parameter and open dialog
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true') {
      setEditOpen(true);
      // Remove the query parameter from URL
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

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
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap relative">
             
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
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"
                title="Account"
                onClick={() => {
                  setForm({
                    firstName: session.user?.firstName || "",
                    lastName: session.user?.lastName || "",
                    email: session.user?.email || "",
                    phone: session.user?.phone || "",
                    domain: userProfile?.domain || "",
                  });
                  setProfileMenuOpen((v) => !v);
                }}
              >
                <UserCircle className="h-6 w-6" />
              </Button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-md border border-border bg-background p-3 shadow-sm">
                  <div className="mb-2">
                    <div className="font-semibold truncate">{session.user?.firstName} {session.user?.lastName}</div>
                    <div className="text-xs text-muted-foreground truncate">{session.user?.email}</div>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setForm({
                        firstName: session.user?.firstName || "",
                        lastName: session.user?.lastName || "",
                        email: session.user?.email || "",
                        phone: session.user?.phone || "",
                        domain: userProfile?.domain || "",
                      });
                      setEditOpen(true);
                    }}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
              
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
                  try {
                    const res = await fetch("/api/user/profile/update", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ currentEmail: session.user?.email, ...form }),
                    });
                    
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      toast({
                        title: "Error",
                        description: err?.error || "Failed to update profile",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    toast({
                      title: "Success",
                      description: "Profile updated successfully!",
                    });
                    setEditOpen(false);
                    window.location.reload();
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "An unexpected error occurred. Please try again.",
                      variant: "destructive",
                    });
                  }
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
          
          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
            {[
              {
                title: "AI Career Roadmap",
                description: "Get personalized career guidance based on your skills and interests",
                icon: <Target className="w-6 h-6 text-blue-600" />,
                status: "Explore",
                href: "/roadmap",
              },
              {
                title: "Opportunity Hub",
                description: "Discover courses, internships, and projects tailored to your path",
                icon: <Briefcase className="w-6 h-6 text-blue-600" />,
                status: "Explore Now",
                href: "/opportunity-hub",
              },
              {
                title: "AI Chatbot Mentor",
                description: "Chat with your AI mentor for personalized advice and guidance",
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                status: "Coming Soon",
              },
              {
                title: "News and Updates",
                description: "Stay informed with the latest industry news and career updates",
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                status: "Explore Now",
                href: "/newsandtrends",
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
                <Card
                  className={`h-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
                    feature.href ? "cursor-pointer transition-shadow hover:shadow-md" : ""
                  }`}
                  onClick={() => {
                    if (feature.href) {
                      // Use a programmatic navigation without importing router here
                      window.location.href = feature.href;
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <Badge variant={feature.href ? "default" : "outline"} className="text-xs">
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
