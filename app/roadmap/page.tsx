"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);

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
                     {/* Header (matching style) */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-4 sm:py-6 lg:py-8">
             <div>
               <h1 className="text-3xl font-bold">Your Roadmaps</h1>
               <p className="text-muted-foreground">Plan and track your personalized learning journeys</p>
             </div>
             <div className="flex items-center gap-3">
               <Button variant="outline" onClick={() => router.push("/dashboard")}> 
                 <ArrowLeft className="h-4 w-4 mr-2" /> Back
               </Button>
               <Button 
                 onClick={async () => {
                   if (!session?.user?.firstName || !userProfile?.domain) {
                     toast({
                       title: "Missing Information",
                       description: "Please complete your profile first.",
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
                         userEmail: session.user.email
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
                       description: "Roadmap created successfully!",
                     });
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
                 }}
                 disabled={isCreatingRoadmap}
               > 
                 {isCreatingRoadmap ? (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                 ) : (
                   <Plus className="h-4 w-4 mr-2" />
                 )}
                 {isCreatingRoadmap ? "Creating..." : "Create New Roadmap"}
               </Button>
             </div>
           </div>

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
                     Start by creating your first roadmap. Define milestones and let us guide you with the right resources.
                   </p>
                                        <Button 
                       onClick={async () => {
                         if (!session?.user?.firstName || !userProfile?.domain) {
                           toast({
                             title: "Missing Information",
                             description: "Please complete your profile first.",
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
                               userEmail: session.user.email
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
                             description: "Roadmap created successfully!",
                           });
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
                       }}
                     disabled={isCreatingRoadmap}
                   > 
                     {isCreatingRoadmap ? (
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     ) : (
                       <Plus className="h-4 w-4 mr-2" />
                     )}
                     {isCreatingRoadmap ? "Creating..." : "Add New Roadmap"}
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
