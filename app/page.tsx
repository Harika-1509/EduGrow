"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  BarChart,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { UserCircle, LogOut, User, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", domain: "" });
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
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
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const features = [
    {
      title: "Personalized Roadmaps",
      description:
        "Get AI-powered career paths tailored to your skills, interests, and goals — no more confusion or wasted effort.",
      icon: <Map className="size-5" />,
    },
    {
      title: "Smart Career Insights",
      description:
        "Discover real-time opportunities with analytics on courses, internships, projects, and hackathons aligned to your profile",
      icon: <BarChart className="size-5" />,
    },
    {
      title: "AI Chatbot Mentor",
      description:
        "Chat with your AI career mentor anytime for personalized advice, learning suggestions, and roadmap adjustments.",
      icon: <MessageSquare className="size-5" />,
    },
    {
      title: "Unified Opportunity Hub",
      description:
        "Access all opportunities in one place — from online courses to workshops and internships, without endless searching.",
      icon: <Briefcase className="size-5" />,
    },
    {
      title: "Trend Visualizer",
      description:
        "Stay ahead with job market trends and skill demand insights, helping you pick the right direction for your future.",
      icon: <TrendingUp className="size-5" />,
    },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header
        className={`sticky top-3 bottom-2 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
          isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
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
          <nav className="hidden md:flex gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {mounted && theme === "dark" ? (
                <Sun className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {session?.user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
                  title="Account"
                  onClick={() => setProfileMenuOpen(v => !v)}
                >
                  <UserCircle className="h-5 w-5" />
                </Button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-11 z-30 w-72 rounded-md border border-border bg-background p-3 shadow-sm">
                    <div className="mb-2">
                      <div className="font-semibold truncate">{session.user?.firstName} {session.user?.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{session.user?.email}</div>
                    </div>
                                                              <div className="grid gap-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setForm({
                              firstName: session.user?.firstName || "",
                              lastName: session.user?.lastName || "",
                              email: session.user?.email || "",
                              phone: session.user?.phone || "",
                              domain: session.user?.domain || "",
                            });
                            setProfileMenuOpen(false);
                            setEditOpen(true);
                          }}
                        >
                          Edit Profile
                        </Button>
                      <Link href="/auth/signout">
                        <Button variant="destructive" className="w-full">
                          <LogOut className="h-4 w-4 mr-2" /> Sign Out
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm mr-6 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            )}
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group cursor-pointer"
              >
                {/* Floating background elements */}
                <motion.div
                  className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-75 blur-lg group-hover:opacity-100 transition-all duration-500"
                  animate={{
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Main button container */}
                <motion.div
                  className="relative rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] overflow-hidden"
                  whileHover={{
                    boxShadow: "0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Button content */}
                  <div className={`relative rounded-full backdrop-blur-xl px-4 py-2 flex items-center gap-2 group-hover:bg-opacity-80 transition-all duration-300 ${
                    theme === 'dark' ? 'bg-black/90 group-hover:bg-black/80' : 'bg-white/90 group-hover:bg-white/80'
                  }`}>
                    <motion.span
                      className={`font-semibold text-sm relative z-10 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                      initial={{ x: 0 }}
                      whileHover={{ x: -2 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      Get Started
                    </motion.span>
                    
                    <motion.div
                      className="relative z-10"
                      initial={{ x: 0, rotate: 0 }}
                      whileHover={{ x: 2, rotate: 15 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <ChevronRight className={`size-4 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`} />
                    </motion.div>
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    
                    {/* Inner glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    
                    {/* Particle effects */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100"
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.5
                      }}
                    />
                    <motion.div
                      className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100"
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: 1
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </Link>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {mounted && theme === "dark" ? (
                <Sun className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
          >
            <div className="container py-4 flex flex-col gap-4">
              <Link
                href="#features"
                className="py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t">
                {session?.user ? (
                  <>
                    <div className="py-2">
                      <div className="font-semibold text-sm">{session.user?.firstName} {session.user?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{session.user?.email}</div>
                    </div>
                                                              <button
                        className="py-2 text-sm font-medium w-full text-left"
                        onClick={() => {
                          setForm({
                            firstName: session.user?.firstName || "",
                            lastName: session.user?.lastName || "",
                            email: session.user?.email || "",
                            phone: session.user?.phone || "",
                            domain: session.user?.domain || "",
                          });
                          setMobileMenuOpen(false);
                          setEditOpen(true);
                        }}
                      >
                        Edit Profile
                      </button>
                    <Link
                      href="/auth/signout"
                      className="py-2 text-sm font-medium text-red-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Floating background elements */}
                    <motion.div
                      className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-75 blur-lg group-hover:opacity-100 transition-all duration-500"
                      animate={{
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Main button container */}
                    <motion.div
                      className="relative rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] overflow-hidden"
                      whileHover={{
                        boxShadow: "0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Button content */}
                      <div className={`relative rounded-full backdrop-blur-xl px-4 py-2 flex items-center gap-2 group-hover:bg-opacity-80 transition-all duration-300 ${
                        theme === 'dark' ? 'bg-black/90 group-hover:bg-black/80' : 'bg-white/90 group-hover:bg-white/80'
                      }`}>
                        <motion.span
                          className={`font-semibold text-sm relative z-10 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}
                          initial={{ x: 0 }}
                          whileHover={{ x: -2 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          Get Started
                        </motion.span>
                        
                        <motion.div
                          className="relative z-10"
                          initial={{ x: 0, rotate: 0 }}
                          whileHover={{ x: 2, rotate: 15 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <ChevronRight className={`size-4 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`} />
                        </motion.div>
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        
                        {/* Inner glow */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        
                        {/* Particle effects */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5
                          }}
                        />
                        <motion.div
                          className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: 1
                          }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 to-transparent dark:from-black/40 z-0"></div> */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge
                className="mb-4 rounded-full mt-10 px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                Welcome
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Your Future, Your Path — With No Confusion
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI-powered career mentor that creates personalized roadmaps and
                connects students to the right courses, projects, hackathons,
                and internships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Floating background elements */}
                    <motion.div
                      className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-75 blur-lg group-hover:opacity-100 transition-all duration-500"
                      animate={{
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Main button container */}
                    <motion.div
                      className="relative rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] overflow-hidden"
                      whileHover={{
                        boxShadow: "0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Button content */}
                      <div className={`relative rounded-full backdrop-blur-xl px-8 py-3 flex items-center gap-3 group-hover:bg-opacity-80 transition-all duration-300 ${
                        theme === 'dark' ? 'bg-black/90 group-hover:bg-black/80' : 'bg-white/90 group-hover:bg-white/80'
                      }`}>
                        <motion.span
                          className={`font-semibold text-base relative z-10 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`}
                          initial={{ x: 0 }}
                          whileHover={{ x: -4 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          Get Started For Free
                        </motion.span>
                        
                        <motion.div
                          className="relative z-10"
                          initial={{ x: 0, rotate: 0 }}
                          whileHover={{ x: 4, rotate: 15 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <ArrowRight className={`size-4 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`} />
                        </motion.div>
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        
                        {/* Inner glow */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        
                        {/* Particle effects */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5
                          }}
                        />
                        <motion.div
                          className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: 1
                          }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-12 px-8 text-base"
                  >
                   Sign In
                  </Button >
                </Link>
              </div>
              {/* <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>14-day trial</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div> */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-7xl"
            >
              <div className="rounded-[30px] p-10 bg-gradient-to-r from-white mb-2 via-purple-200 to-purple-100 dark:from-white/20 dark:via-pink-200/40 dark:to-pink-600/50 backdrop-blur-[80px]">
                <div className="relative rounded-7xl overflow-hidden bg-gradient-to-b from-background to-muted/20">
                  <Image
                    src={mounted && theme === 'dark' ? "/dmdb.PNG" : "/lmdb.PNG"}
                    width={1600}
                    height={900}
                    alt="Dashboard preview"
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Logos Section */}
        {/* <section className="w-full py-12 border-y bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Trusted by innovative companies worldwide
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                    key={i}
                    src={`/placeholder-logo.svg`}
                    alt={`Company logo ${i}`}
                    width={120}
                    height={60}
                    className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything You Need to Succeed
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Our comprehensive platform provides all the tools you need to
                streamline your workflow, boost productivity, and achieve your
                goals.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full  py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Simple Process, Powerful Results
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Get started in minutes and see the difference our platform can
                make for your business.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0"></div>

              {[
                {
                  step: "01",
                  title: "Create Account",
                  description:
                    "Sign up quickly with your email and create a personalized profile by adding details about your skills, interests, and career goals. ",
                },
                {
                  step: "02",
                  title: "Choose Your Domain",
                  description:
                    "Select the career domains you are passionate about, such as AI, Web Development, Data Science, or Design. ",
                },
                {
                  step: "03",
                  title: "Explore & Achieve",
                  description:
                    "Discover curated courses, projects, hackathons, and internships that match your chosen path and roadmap. ",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {/* <section id="testimonials" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Loved by Teams Worldwide
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Don't just take our word for it. See what our customers have to
                say about their experience.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "SaaSify has transformed how we manage our projects. The automation features have saved us countless hours of manual work.",
                  author: "Sarah Johnson",
                  role: "Project Manager, TechCorp",
                  rating: 5,
                },
                {
                  quote:
                    "The analytics dashboard provides insights we never had access to before. It's helped us make data-driven decisions that have improved our ROI.",
                  author: "Michael Chen",
                  role: "Marketing Director, GrowthLabs",
                  rating: 5,
                },
                {
                  quote:
                    "Customer support is exceptional. Any time we've had an issue, the team has been quick to respond and resolve it. Couldn't ask for better service.",
                  author: "Emily Rodriguez",
                  role: "Operations Lead, StartupX",
                  rating: 5,
                },
                {
                  quote:
                    "We've tried several similar solutions, but none compare to the ease of use and comprehensive features of SaaSify. It's been a game-changer.",
                  author: "David Kim",
                  role: "CEO, InnovateNow",
                  rating: 5,
                },
                {
                  quote:
                    "The collaboration tools have made remote work so much easier for our team. We're more productive than ever despite being spread across different time zones.",
                  author: "Lisa Patel",
                  role: "HR Director, RemoteFirst",
                  rating: 5,
                },
                {
                  quote:
                    "Implementation was seamless, and the ROI was almost immediate. We've reduced our operational costs by 30% since switching to SaaSify.",
                  author: "James Wilson",
                  role: "COO, ScaleUp Inc",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex mb-4">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, j) => (
                            <Star
                              key={j}
                              className="size-4 text-yellow-500 fill-yellow-500"
                            />
                          ))}
                      </div>
                      <p className="text-lg mb-6 flex-grow">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Pricing Section */}
        {/* <section
          id="pricing"
          className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Choose the plan that's right for your business. All plans
                include a 14-day free trial.
              </p>
            </motion.div>

            <div className="mx-auto max-w-5xl">
              <Tabs defaultValue="monthly" className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="rounded-full p-1">
                    <TabsTrigger value="monthly" className="rounded-full px-6">
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="annually" className="rounded-full px-6">
                      Annually (Save 20%)
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="monthly">
                  <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    {[
                      {
                        name: "Starter",
                        price: "$29",
                        description: "Perfect for small teams and startups.",
                        features: [
                          "Up to 5 team members",
                          "Basic analytics",
                          "5GB storage",
                          "Email support",
                        ],
                        cta: "Start Free Trial",
                      },
                      {
                        name: "Professional",
                        price: "$79",
                        description: "Ideal for growing businesses.",
                        features: [
                          "Up to 20 team members",
                          "Advanced analytics",
                          "25GB storage",
                          "Priority email support",
                          "API access",
                        ],
                        cta: "Start Free Trial",
                        popular: true,
                      },
                      {
                        name: "Enterprise",
                        price: "$199",
                        description:
                          "For large organizations with complex needs.",
                        features: [
                          "Unlimited team members",
                          "Custom analytics",
                          "Unlimited storage",
                          "24/7 phone & email support",
                          "Advanced API access",
                          "Custom integrations",
                        ],
                        cta: "Contact Sales",
                      },
                    ].map((plan, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${
                            plan.popular
                              ? "border-primary shadow-lg"
                              : "border-border/40 shadow-md"
                          } bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-baseline mt-4">
                              <span className="text-4xl font-bold">
                                {plan.price}
                              </span>
                              <span className="text-muted-foreground ml-1">
                                /month
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-2">
                              {plan.description}
                            </p>
                            <ul className="space-y-3 my-6 flex-grow">
                              {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-center">
                                  <Check className="mr-2 size-4 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`w-full mt-auto rounded-full ${
                                plan.popular
                                  ? "bg-primary hover:bg-primary/90"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                              variant={plan.popular ? "default" : "outline"}
                            >
                              {plan.cta}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="annually">
                  <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    {[
                      {
                        name: "Starter",
                        price: "$23",
                        description: "Perfect for small teams and startups.",
                        features: [
                          "Up to 5 team members",
                          "Basic analytics",
                          "5GB storage",
                          "Email support",
                        ],
                        cta: "Start Free Trial",
                      },
                      {
                        name: "Professional",
                        price: "$63",
                        description: "Ideal for growing businesses.",
                        features: [
                          "Up to 20 team members",
                          "Advanced analytics",
                          "25GB storage",
                          "Priority email support",
                          "API access",
                        ],
                        cta: "Start Free Trial",
                        popular: true,
                      },
                      {
                        name: "Enterprise",
                        price: "$159",
                        description:
                          "For large organizations with complex needs.",
                        features: [
                          "Unlimited team members",
                          "Custom analytics",
                          "Unlimited storage",
                          "24/7 phone & email support",
                          "Advanced API access",
                          "Custom integrations",
                        ],
                        cta: "Contact Sales",
                      },
                    ].map((plan, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${
                            plan.popular
                              ? "border-primary shadow-lg"
                              : "border-border/40 shadow-md"
                          } bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-baseline mt-4">
                              <span className="text-4xl font-bold">
                                {plan.price}
                              </span>
                              <span className="text-muted-foreground ml-1">
                                /month
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-2">
                              {plan.description}
                            </p>
                            <ul className="space-y-3 my-6 flex-grow">
                              {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-center">
                                  <Check className="mr-2 size-4 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`w-full mt-auto rounded-full ${
                                plan.popular
                                  ? "bg-primary hover:bg-primary/90"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                              variant={plan.popular ? "default" : "outline"}
                            >
                              {plan.cta}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Find answers to common questions about our platform.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "How does CareerPath work?",
                    answer:
                      "CareerPath uses AI to create a personalized career roadmap based on your skills, interests, learning style, and available time. It also connects you to curated courses, internships, projects, and hackathons.",
                  },
                  {
                    question: "Do I need to pay to use CareerPath?",
                    answer:
                      "No, CareerPath is free to start. You can access AI-generated roadmaps and explore opportunities at no cost. Premium features may be added in the future.",
                  },
                  {
                    question: "Can I change my chosen career path later?",
                    answer:
                      "Yes, you can update your interests, domains, and goals anytime. You can adjust your roadmap to match your changing needs and interests.",
                  },
                  {
                    question: "What kind of opportunities can I explore?",
                    answer:
                      "You’ll find online courses, internships, projects, hackathons, and workshops, all tailored to your profile.",
                  },
                  {
                    question: "How secure is my data?",
                    answer:
                      "Your data is encrypted and stored securely. We only use your profile information to personalize recommendations — we never share it with third parties.",
                  },
                  {
                    question: "Do I need technical skills to use CareerPath?",
                    answer:
                      "Not at all. The platform is designed for all students, whether you are from a tech background or exploring other domains.",
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <AccordionItem
                      value={`item-${i}`}
                      className="border-b border-border/40 py-2"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold">
                <Image
                  key={mounted ? theme : 'loading'}
                  src={mounted && theme === 'dark' ? "/main-logo-dark.png" : "/main-logo.png"}
                  alt="CareerPath Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered career mentor that helps students find clear,
                personalized roadmaps and explore the right opportunities.
              </p>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    AI Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Career Insights
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Opportunity Hub
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">About Us</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About CareerPath
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CareerPath. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
                 </div>
       </footer>

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
                 if (!session?.user?.email) {
                   toast({
                     title: "Error",
                     description: "Session not found. Please log in again.",
                     variant: "destructive",
                   });
                   return;
                 }
                 try {
                   const res = await fetch("/api/user/profile/update", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ currentEmail: session.user.email, ...form }),
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
                 <option value="">Select a domain</option>
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
     </div>
   );
 }
