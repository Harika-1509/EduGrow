"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Target, ArrowLeft, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    if (status === "authenticated" && session?.user) {
      // Fetch user profile and roadmaps
      const fetchData = async () => {
        try {
          // Fetch user profile
          const profileResponse = await fetch(`/api/user/${session.user.id}`);
          if (profileResponse.ok) {
            const userData = await profileResponse.json();
            setUserProfile(userData);
          }

          // Fetch roadmaps by email
          const roadmapsResponse = await fetch(`/api/roadmap/user/${encodeURIComponent(session.user.email)}`);
          if (roadmapsResponse.ok) {
            const { roadmaps } = await roadmapsResponse.json();
            setRoadmaps(roadmaps);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [status, session, router]);

  const handleCreateRoadmap = async () => {
    if (!session?.user?.firstName || !userProfile?.domain) {
      toast({
        title: "Missing Information",
        description: "Please complete your profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!goal.trim()) {
      toast({
        title: "Missing Goal",
        description: "Please enter your career goal to create a personalized roadmap.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingRoadmap(true);
    try {
      const response = await fetch("/api/roadmap/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: session.user.firstName,
          domain: userProfile.domain,
          userEmail: session.user.email,
          goal: goal.trim()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create roadmap",
          variant: "destructive",
        });
        return;
      }
      
      const { roadmap } = await response.json();
      toast({
        title: "Success",
        description: "AI-powered roadmap created successfully!",
      });
      setShowCreateDialog(false);
      setGoal("");
      router.push(`/roadmap/${roadmap.chatId}`);
    } catch (error) {
      console.error("Error creating roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to create roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoadmap(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-4 sm:gap-6 lg:py-8">
            <div>
              <h1 className="text-3xl font-bold">Your AI-Powered Roadmaps</h1>
              <p className="text-muted-foreground">Plan and track your personalized learning journeys with Groq AI</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/dashboard")}> 
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                disabled={isCreatingRoadmap}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              > 
                <Bot className="h-4 w-4 mr-2" />
                Create AI Roadmap
              </Button>
            </div>
          </div>

          {/* AI Roadmap Creation Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Create AI-Powered Roadmap
                </DialogTitle>
                <DialogDescription>
                  Let Groq AI create a personalized roadmap for your career goals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Career Goal
                  </label>
                  <Input
                    placeholder="e.g., Becoming a backend developer"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateRoadmap()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific about what you want to achieve
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRoadmap}
                    disabled={!goal.trim() || isCreatingRoadmap}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isCreatingRoadmap ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Bot className="h-4 w-4 mr-2" />
                    )}
                    {isCreatingRoadmap ? "Creating..." : "Generate Roadmap"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Roadmaps List or Empty State */}
          {roadmaps.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card 
                    className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/roadmap/${roadmap.chatId}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">🗺️</div>
                        <div>
                          <h3 className="font-semibold text-lg">{roadmap.name}</h3>
                          <p className="text-sm text-muted-foreground">{roadmap.domain}</p>
                          {roadmap.goal && (
                            <p className="text-xs text-blue-600 mt-1">
                              Goal: {roadmap.goal}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{roadmap.todoList.length} items</span>
                        <span>{new Date(roadmap.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="p-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-5xl">🗺️</div>
                  <h2 className="text-xl font-semibold">No roadmaps yet</h2>
                  <p className="text-muted-foreground max-w-md">
                    Start by creating your first AI-powered roadmap. Define your career goal and let Groq AI create a personalized learning path for you.
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    disabled={isCreatingRoadmap}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  > 
                    <Bot className="h-4 w-4 mr-2" />
                    Create AI Roadmap
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
