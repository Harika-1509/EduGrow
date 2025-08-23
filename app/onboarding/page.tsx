"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Brain, Target, ChevronRight, Edit3, MessageSquare, Globe, BarChart, Palette, Shield, Smartphone, Cloud, Link, Gamepad2, Settings, TrendingUp, Code, Briefcase, Megaphone, DollarSign, Heart, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { useSessionRefresh } from "@/hooks/use-session-refresh";

const DOMAINS = [
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
  "Sales & Business Development"
];

const ONBOARDING_STEPS = [
  {
    id: "personalBackground",
    title: "Personal Background",
    questions: [
      {
        id: "education",
        question: "What is your current level of education?",
        type: "text",
        placeholder: "e.g., High School, Undergraduate, Postgraduate, PhD",
        examples: "Examples: High School, Undergraduate, Postgraduate, PhD"
      },
      {
        id: "fieldOfStudy",
        question: "What is your field of study (or intended major)?",
        type: "text",
        placeholder: "e.g., Computer Science, Commerce, Biology, Engineering, Arts",
        examples: "Examples: Computer Science, Commerce, Biology, Engineering, Arts"
      },
      {
        id: "workPreference",
        question: "Do you prefer working in technical, creative, managerial, or research-oriented roles?",
        type: "text",
        placeholder: "e.g., Technical, Creative, Managerial, Research-oriented, or describe your preference",
        examples: "Examples: Technical, Creative, Managerial, Research-oriented"
      }
    ]
  },
  {
    id: "interests",
    title: "Interests & Passion",
    questions: [
      {
        id: "activities",
        question: "Which activities do you enjoy the most?",
        type: "textarea",
        placeholder: "e.g., Coding & Problem-Solving, Designing/Art, Teaching/Helping Others, Research & Analysis, Communication & Networking, Planning & Strategy",
        examples: "Examples: Coding & Problem-Solving, Designing/Art, Teaching/Helping Others, Research & Analysis"
      },
      {
        id: "industries",
        question: "Which industries excite you the most?",
        type: "textarea",
        placeholder: "e.g., Tech (AI, Software, Data Science), Business & Finance, Healthcare, Education, Entertainment & Media, Manufacturing, Retail & E-commerce",
        examples: "Examples: Tech (AI, Software, Data Science), Business & Finance, Healthcare, Education"
      }
    ]
  },
  {
    id: "skills",
    title: "Skills & Strengths",
    questions: [
      {
        id: "currentSkills",
        question: "What skills do you currently have?",
        type: "textarea",
        placeholder: "e.g., Programming, Data Analysis, Communication, Design, Project Management, Problem Solving, Leadership, Research",
        examples: "Examples: Programming, Data Analysis, Communication, Design, Project Management"
      },
      {
        id: "technicalLevel",
        question: "How do you rate your current technical/computer skills?",
        type: "text",
        placeholder: "e.g., Beginner, Intermediate, Advanced, or describe your level",
        examples: "Examples: Beginner, Intermediate, Advanced"
      }
    ]
  },
  {
    id: "workPreferences",
    title: "Work Preferences",
    questions: [
      {
        id: "workWith",
        question: "Do you prefer working with:",
        type: "text",
        placeholder: "e.g., People, Data, Ideas, or describe your preference",
        examples: "Examples: People, Data, Ideas"
      },
      {
        id: "workLocation",
        question: "Do you want to work:",
        type: "text",
        placeholder: "e.g., Remotely, Hybrid, On-site, or describe your preference",
        examples: "Examples: Remotely, Hybrid, On-site"
      },
      {
        id: "workEnvironment",
        question: "What type of work environment suits you best?",
        type: "text",
        placeholder: "e.g., Startup Culture, Corporate, Research/Academia, or describe your ideal environment",
        examples: "Examples: Startup Culture, Corporate, Research/Academia"
      }
    ]
  },
  {
    id: "goals",
    title: "Goals & Aspirations",
    questions: [
      {
        id: "motivation",
        question: "What motivates you the most in a career?",
        type: "text",
        placeholder: "e.g., High Salary, Work-Life Balance, Helping Society, Learning & Growth, Recognition, Innovation",
        examples: "Examples: High Salary, Work-Life Balance, Helping Society, Learning & Growth, Recognition, Innovation"
      },
      {
        id: "longTermVision",
        question: "What is your long-term career vision?",
        type: "text",
        placeholder: "e.g., Becoming an Expert, Leading a Team, Building a Startup, Research & Development, Consulting, Teaching",
        examples: "Examples: Becoming an Expert, Leading a Team, Building a Startup, Research & Development, Consulting, Teaching"
      }
    ]
  },
  {
    id: "constraints",
    title: "Constraints & Preferences",
    questions: [
      {
        id: "openToAbroad",
        question: "Are you open to working abroad?",
        type: "text",
        placeholder: "e.g., Yes, No, Maybe, or describe your preferences and constraints",
        examples: "Examples: Yes, No, Maybe, or describe your preferences and constraints"
      },
      {
        id: "learningTime",
        question: "How much time can you dedicate to learning new skills?",
        type: "text",
        placeholder: "e.g., <5 hrs/week, 5–10 hrs/week, 10+ hrs/week, or describe your availability",
        examples: "Examples: <5 hrs/week, 5–10 hrs/week, 10+ hrs/week, or describe your availability"
      },
      {
        id: "higherStudies",
        question: "Are you okay with higher studies (Masters, Certifications, PhD)?",
        type: "text",
        placeholder: "e.g., Yes, No, or describe your thoughts on further education",
        examples: "Examples: Yes, No, or describe your thoughts on further education"
      },
      {
        id: "financialConstraints",
        question: "Any financial constraints for paid courses?",
        type: "text",
        placeholder: "e.g., ₹1000/month, ₹5000/month, ₹10000/month, No constraints, or describe your budget",
        examples: "Examples: ₹1000/month, ₹5000/month, ₹10000/month, No constraints, or describe your budget"
      }
    ]
  }
];

// Helper function to get summarization step text
const getSummarizationStepText = (step: number): string => {
  switch (step) {
    case 0:
      return "Analyzing your background and preferences";
    case 1:
      return "Evaluating skills and work preferences";
    case 2:
      return "Calculating domain matches and generating recommendations";
    default:
      return "Processing...";
  }
};

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { refreshSession } = useSessionRefresh();
  
  const [onboardingType, setOnboardingType] = useState<"domain" | "ai" | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  // removed isSaving UI
  const [showSummarization, setShowSummarization] = useState(false);
  const [summarizationStep, setSummarizationStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFinalDomain, setSelectedFinalDomain] = useState<string>("");

  // No server-side onboardingData persistence. Answers are kept in state/localStorage only.

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    console.log("Session effect triggered:", { 
      status, 
      hasSession: !!session, 
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (status === "authenticated" && session?.user) {
      console.log("Session loaded:", { 
        email: session.user.email,
        onboarding: session.user.onboarding 
      });
      
      // Check if onboarding is already completed
      if (session.user.onboarding === true) {
        console.log("User has completed onboarding, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }
      
      // If onboarding is false or undefined, continue with onboarding
      console.log("User needs to complete onboarding, continuing...");  
    } else if (status === "unauthenticated") {
      console.log("User is unauthenticated, redirecting to login");
      router.push("/auth/login");
    } else {
      console.log("Session status:", { status, hasSession: !!session, hasUser: !!session?.user });
    }
  }, [session, status, router]);

  // Handle summarization step progression
  useEffect(() => {
    if (showSummarization && summarizationStep < 3) {
      const timer = setTimeout(() => {
        setSummarizationStep(prev => prev + 1);
      }, 2000); // Each step takes 2 seconds

      return () => clearTimeout(timer);
    }
  }, [showSummarization, summarizationStep]);

  // Persist answers/currentStep locally so tab switches don't lose data
  useEffect(() => {
    const email = session?.user?.email;
    if (!email || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(`onboardingAnswers:${email}`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          if (saved.answers && typeof saved.answers === 'object') {
            setAnswers((prev) => Object.keys(prev).length ? prev : saved.answers);
          }
          if (typeof saved.currentStep === 'number') {
            setCurrentStep((prev) => prev || saved.currentStep);
          }
          if (saved.onboardingType === 'domain' || saved.onboardingType === 'ai' || saved.onboardingType === null) {
            setOnboardingType((prev) => prev ?? saved.onboardingType);
          }
        }
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email || typeof window === 'undefined') return;
    const payload = JSON.stringify({ answers, currentStep, onboardingType });
    try {
      localStorage.setItem(`onboardingAnswers:${email}`, payload);
    } catch {}
  }, [answers, currentStep, onboardingType, session?.user?.email]);

  // Save just before tab is hidden/closed
  useEffect(() => {
    const email = session?.user?.email;
    if (!email || typeof window === 'undefined') return;
    const saveNow = () => {
      try {
        localStorage.setItem(
          `onboardingAnswers:${email}`,
          JSON.stringify({ answers, currentStep, onboardingType })
        );
      } catch {}
    };
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') saveNow();
    };
    window.addEventListener('beforeunload', saveNow);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', saveNow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [answers, currentStep, onboardingType, session?.user?.email]);

  // Wait for session to be fully loaded and complete
  // Also add a timeout check for stuck sessions
  const [sessionTimeout, setSessionTimeout] = useState(false);
  
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.email) {
      const timer = setTimeout(() => {
        setSessionTimeout(true);
      }, 5000); // 5 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [status, session?.user?.email]);
  
  // Check if session is incomplete
  const isSessionIncomplete = !session?.user?.email || session?.user?.onboarding === undefined;
  const shouldShowLoading = status === "loading" || isSessionIncomplete || sessionTimeout;
  
  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {status === "loading" ? "Loading session..." : "Initializing session..."}
          </p>
          {status !== "loading" && !session?.user?.email && (
                         <div className="mt-4 space-y-2">
               <p className="text-sm text-orange-600">
                 {sessionTimeout ? "Session timeout - taking too long to load" : 
                  status === "authenticated" ? "Session authenticated but incomplete - missing user data" :
                  "Session incomplete. Missing required user data."}
               </p>
               <div className="text-xs text-gray-500">
                 <p>Status: {status}</p>
                 <p>Has Session: {!!session}</p>
                 <p>User ID: {session?.user?.id || 'undefined'}</p>
                 <p>Email: {session?.user?.email || 'undefined'}</p>
                 <p>Onboarding: {session?.user?.onboarding || 'undefined'}</p>
               </div>
               <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                 <p className="font-medium">Issue:</p>
                 <p>• User ID is missing from session</p>
                 <p>• Onboarding status is undefined</p>
                 <p>• This usually means the session was corrupted</p>
                 <p className="mt-2 font-medium text-blue-600">Recommended Solution:</p>
                 <p>• Click "Logout" to clear the corrupted session</p>
                 <p>• Then log back in with your credentials</p>
               </div>
                             <div className="flex gap-2 justify-center flex-wrap">
                 <Button 
                   onClick={() => window.location.reload()} 
                   size="sm"
                   variant="outline"
                 >
                   Refresh Page
                 </Button>
                 <Button 
                   onClick={() => refreshSession()} 
                   size="sm"
                   variant="outline"
                 >
                   Refresh Session
                 </Button>
                 <Button 
                   onClick={() => {
                     // Force clear all session data
                     localStorage.clear();
                     sessionStorage.clear();
                     window.location.reload();
                   }} 
                   size="sm"
                   variant="outline"
                 >
                   Force Clear & Reload
                 </Button>
                 <Button 
                   onClick={() => router.push("/auth/login")} 
                   size="sm"
                   variant="outline"
                 >
                   Go to Login
                 </Button>
                 <Button 
                   onClick={() => {
                     // Clear session and redirect to login
                     signOut({ callbackUrl: "/auth/login" });
                   }} 
                   size="sm"
                   variant="destructive"
                 >
                   Logout
                 </Button>
               </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-medium">Debug Info:</p>
                <p>Full Session: {JSON.stringify(session, null, 2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }



  const handleDomainSelection = async () => {
    if (!selectedDomain) {
      toast({
        title: "Error",
        description: "Please select a domain to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user?.email,
          domain: selectedDomain,
          isComplete: true, // Mark onboarding as completed
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save domain selection");
      }

      // Clear local draft and refresh session to get updated onboarding status
      try { localStorage.removeItem(`onboardingAnswers:${session?.user?.email}`); } catch {}
      await refreshSession();

      toast({
        title: "Success",
        description: "Domain selected successfully! Redirecting to LAKO NOWN dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save domain selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(newAnswers);
    
    // Auto-save progress
    if (session?.user?.email) {
      saveProgress(newAnswers);
    }
  };

  const saveProgress = async (_progressData: Record<string, any>) => {
    // No-op server call. Answers are saved locally via useEffect/localStorage.
    // This function remains to keep the call sites simple.
    return;
  };

  const handleNextStep = () => {
    // Check if current step questions are answered
    const currentStepData = ONBOARDING_STEPS[currentStep];
    const currentAnswers = currentStepData.questions.map(q => answers[q.id]).filter(Boolean);
    
    if (currentAnswers.length < currentStepData.questions.length) {
      toast({
        title: "Please complete all questions",
        description: "Please answer all questions in this step before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAISubmit = async () => {
    // Check if session and user email are available
    if (!session?.user?.email) {
      console.error("Session validation failed:", { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        email: session?.user?.email,
        status 
      });
      
      toast({
        title: "Session Error",
        description: "Please refresh the page and try again. If the issue persists, please log out and log back in.",
        variant: "destructive",
      });
      return;
    }

    // Check if all questions are answered
    const totalQuestions = ONBOARDING_STEPS.reduce((acc, step) => acc + step.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < totalQuestions) {
      toast({
        title: "Please complete all questions",
        description: `You have answered ${answeredQuestions} out of ${totalQuestions} questions. Please complete all questions before submitting.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Console analysis process and run Gemini, then show options
      console.log("[Gemini] Starting analysis", {
        totalAnswers: Object.keys(answers).length,
        answeredIds: Object.keys(answers),
      });
      setShowSummarization(true);
      setSummarizationStep(0);
      try {
        console.log("[Gemini] Sending request to /api/ai/analyze");
        const analysisResponse = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (analysisResponse.ok) {
          const result = await analysisResponse.json();
          console.log("[Gemini] Analysis success", {
            hasTopDomains: !!result.analysis?.topDomains,
            topDomainsCount: result.analysis?.topDomains?.length ?? 0,
            hasInsights: !!result.analysis?.overallInsights,
          });
          setAnalysisResult(result.analysis);
        } else {
          console.warn("[Gemini] Analysis failed", await analysisResponse.text());
        }
      } catch (e) {
        console.error("[Gemini] Request error", e);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save onboarding data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalDomainSelection = async (domain: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user?.email,
          domain: domain,
          isComplete: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save domain selection");
      }

      // Clear local draft now that onboarding is complete
      try { localStorage.removeItem(`onboardingAnswers:${session?.user?.email}`); } catch {}

      // Refresh session to get updated onboarding status
      await refreshSession();

      toast({
        title: "Success",
        description: "Domain selected successfully! Redirecting to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save domain selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = (question: any) => {
    if (question.type === "text") {
      return (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <input
              type="text"
              id={question.id}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/30"
            />
            <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>
      );
    }

    if (question.type === "textarea") {
      return (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <textarea
              id={question.id}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none hover:border-primary/30"
            />
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>
      );
    }

    return null;
  };

  if (onboardingType === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="container mx-auto max-w-4xl min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Welcome to CareerPath!</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Let's personalize your career journey. Choose how you'd like to get started.
              </p>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Domain Selection */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                onClick={() => setOnboardingType("domain")}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Choose Your Domain</CardTitle>
                  <CardDescription>
                    Select a career domain you're passionate about and get started immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full">
                    Select Domain
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* AI Guided */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                onClick={() => setOnboardingType("ai")}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>AI-Guided Assessment</CardTitle>
                  <CardDescription>
                    Let our AI analyze your preferences and recommend the best career path
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full">
                    Start Assessment
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (onboardingType === "domain") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="container mx-auto max-w-4xl min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <Button
                variant="ghost"
                onClick={() => setOnboardingType(null)}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-4xl font-bold">Choose Your Career Domain</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Select the career domain that excites you the most. You can always change this later.
              </p>
            </div>

            {/* Domain Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {DOMAINS.map((domain) => {
                // Get appropriate icon for each domain
                const getDomainIcon = (domainName: string) => {
                  switch (domainName.toLowerCase()) {
                    case 'ai & machine learning':
                      return <Brain className="w-6 h-6 text-primary" />;
                    case 'web development':
                      return <Globe className="w-6 h-6 text-primary" />;
                    case 'data science':
                      return <BarChart className="w-6 h-6 text-primary" />;
                    case 'mobile development':
                      return <Smartphone className="w-6 h-6 text-primary" />;
                    case 'cybersecurity':
                      return <Shield className="w-6 h-6 text-primary" />;
                    case 'cloud computing':
                      return <Cloud className="w-6 h-6 text-primary" />;
                    case 'devops':
                      return <Settings className="w-6 h-6 text-primary" />;
                    case 'ui/ux design':
                      return <Palette className="w-6 h-6 text-primary" />;
                    case 'digital marketing':
                      return <Megaphone className="w-6 h-6 text-primary" />;
                    case 'business analytics':
                      return <TrendingUp className="w-6 h-6 text-primary" />;
                    case 'product management':
                      return <Briefcase className="w-6 h-6 text-primary" />;
                    case 'sales & business development':
                      return <DollarSign className="w-6 h-6 text-primary" />;
                    default:
                      return <Briefcase className="w-6 h-6 text-primary" />;
                  }
                };

                return (
                  <Card
                    key={domain}
                    className={`cursor-pointer transition-all ${
                      selectedDomain === domain
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/30 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedDomain(domain)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        {getDomainIcon(domain)}
                      </div>
                      <p className="text-sm font-medium">{domain}</p>
                      {selectedDomain === domain && (
                        <Check className="w-5 h-5 text-primary mx-auto mt-2" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleDomainSelection}
                disabled={!selectedDomain || isLoading}
                className="px-8"
              >
                {isLoading ? "Saving..." : "Continue with Selected Domain"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (onboardingType === "ai") {
    // Show summarization if all questions are completed
    if (showSummarization) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
          <div className="container mx-auto max-w-4xl min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 text-center"
            >
              {/* Summarization Steps */}
              {summarizationStep < 3 ? (
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold">Analyzing Your Profile</h1>
                  <p className="text-xl text-muted-foreground">
                    Step {summarizationStep + 1}: {getSummarizationStepText(summarizationStep)}
                  </p>
                  
                  {/* Step-specific content */}
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{getSummarizationStepText(summarizationStep)}</p>
                      <p className="text-sm text-muted-foreground">Processing...</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Results Display */
                <div className="space-y-8 w-full max-w-3xl">
                  <h1 className="text-4xl font-bold">Your Career Analysis Results</h1>
                  
                  {/* Top 3 Domains */}
                  {analysisResult?.topDomains && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Top 3 Recommended Domains</h2>
                      <div className="grid gap-4">
                        {analysisResult.topDomains.map((domain: any, index: number) => (
                          <motion.div
                            key={domain.domain}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card className="border-border/40 bg-background/95 backdrop-blur">
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg">{domain.domain}</CardTitle>
                                      <CardDescription>{domain.reasoning}</CardDescription>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                      {domain.percentage}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Score: {domain.score}/10
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overall Insights */}
                  {analysisResult?.overallInsights && (
                    <Card className="border-border/40 bg-background/95 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-xl">Overall Career Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{analysisResult.overallInsights}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSummarization(false);
                        setCurrentStep(0);
                        setAnswers({});
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Try Again
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Show all domains
                        setShowSummarization(false);
                        setOnboardingType("domain");
                      }}
                      className="flex items-center gap-2"
                    >
                      View All Domains
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (selectedFinalDomain) {
                          handleFinalDomainSelection(selectedFinalDomain);
                        }
                      }}
                      disabled={!selectedFinalDomain}
                      className="flex items-center gap-2"
                    >
                      Continue with Selected Domain
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Domain Selection Dropdown */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Or select a specific domain:</label>
                    <select
                      value={selectedFinalDomain}
                      onChange={(e) => setSelectedFinalDomain(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Choose a domain...</option>
                      {analysisResult?.domainScores?.map((domain: any) => (
                        <option key={domain.domain} value={domain.domain}>
                          {domain.domain} ({domain.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      );
    }

    const currentStepData = ONBOARDING_STEPS[currentStep];
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="container mx-auto px-6 lg:px-10 max-w-7xl min-h-screen py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4 mb-2">
              <Button
                variant="ghost"
                onClick={() => setOnboardingType(null)}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-4xl font-bold">AI Career Assessment</h1>
              <p className="text-xl text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}: {currentStepData.title}
              </p>
              {Object.keys(answers).length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium">Welcome back! Your progress has been saved.</p>
                  <p className="text-xs text-muted-foreground">You can continue from where you left off.</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 max-w-5xl mx-auto">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Progress Info */}
            <div className="text-center text-sm text-muted-foreground max-w-3xl mx-auto">
              {Object.keys(answers).length > 0 && (
                <div className="space-y-1">
                  <p>Progress saved: {Object.keys(answers).length} questions answered</p>
                  <p className="text-xs">Overall completion: {Math.round(progress)}%</p>
                  {/* saving progress UI removed */}
                </div>
              )}
            </div>


             {/* Tips Section */}
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
               <div className="flex items-start space-x-3">
                 <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-blue-600 text-sm">💡</span>
                 </div>
                 <div className="text-sm text-blue-800">
                   <p className="font-medium mb-1">Tips for better answers:</p>
                   <ul className="space-y-1 text-xs">
                     <li>• Be specific and detailed rather than brief</li>
                     <li>• Think about your real experiences and preferences</li>
                     <li>• Don't worry about being perfect - honest answers work best</li>
                     <li>• You can always come back and edit your responses later</li>
                   </ul>
                 </div>
               </div>
             </div>

            {/* Current Step */}
            <Card className="border-border/40 bg-background/95 backdrop-blur max-w-5xl mx-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription>
                  Let's understand your preferences better
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 md:space-y-8">
                {currentStepData.questions.map((question) => (
                  <div key={question.id} className="space-y-4">
                                         <div className="flex items-center justify-between">
                       <div>
                         <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
                       </div>
                       {answers[question.id] && (
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Answered</span>
                         </div>
                       )}
                     </div>
                    {renderQuestion(question)}
                    {answers[question.id] && (
                      <div className="text-xs text-muted-foreground text-right flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>{answers[question.id].length} characters</span>
                        {question.type === "textarea" && (
                          <div className="w-16 bg-muted rounded-full h-1">
                            <div 
                              className="bg-green-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((answers[question.id].length / 100) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                        {answers[question.id].length > 200 && (
                          <span className="text-orange-600">⚠️ Getting long</span>
                        )}
                      </div>
                    )}
                    
                  </div>
                ))}
              </CardContent>
            </Card>

                         {/* Navigation */}
             <div className="max-w-5xl mx-auto w-full">
               {/* Top: step count */}
               <div className="text-center text-sm text-muted-foreground mb-3">
                 <p>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
                 <p className="text-xs">Your progress is automatically saved</p>
               </div>

               {/* Bottom: buttons */}
               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                 <Button
                   variant="outline"
                   onClick={handlePrevStep}
                   disabled={currentStep === 0}
                   className="sm:w-auto"
                 >
                   <ArrowLeft className="mr-2 h-4 w-4" />
                   Previous
                 </Button>

                 {currentStep === ONBOARDING_STEPS.length - 1 ? (
                   <div className="sm:text-right">
                     {!session?.user?.email && (
                       <div className="text-xs text-orange-600 mb-2 text-center sm:text-right">
                         ⚠️ Session loading, please wait...
                       </div>
                     )}
                     <Button
                       onClick={handleAISubmit}
                       disabled={isLoading || !session?.user?.email}
                       className="px-8 sm:ml-auto"
                     >
                       {isLoading ? "Completing..." : "Complete Assessment"}
                       <Check className="ml-2 h-4 w-4" />
                     </Button>
                   </div>
                 ) : (
                   <Button onClick={handleNextStep} className="sm:ml-auto">
                     Next
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                 )}
               </div>
             </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
