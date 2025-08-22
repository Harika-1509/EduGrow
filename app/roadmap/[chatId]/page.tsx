"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, CheckCircle, Circle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

interface Roadmap {
  _id: string;
  name: string;
  domain: string;
  chatId: string;
  userEmail: string;
  goal?: string | null;
  priorKnowledge?: string | null;
  chosenTrack?: string | null;
  todoList: TodoItem[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  _id?: string;
  content: string;
  role: "user" | "bot";
  createdAt?: string;
}

export default function RoadmapChatPage({ params }: { params: { chatId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTodosOpen, setIsTodosOpen] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    if (status === "authenticated") {
      fetchRoadmap();
      fetchMessages();
    }
  }, [status, router]);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch(`/api/roadmap/${params.chatId}`);
      if (response.ok) {
        const { roadmap } = await response.json();
        setRoadmap(roadmap);
      } else {
        toast({
          title: "Error",
          description: "Roadmap not found",
          variant: "destructive",
        });
        router.push("/roadmap");
      }
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to load roadmap",
        variant: "destructive",
      });
      router.push("/roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${params.chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const appendMessage = async (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    try {
      await fetch(`/api/messages/${params.chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg.content, role: msg.role }),
      });
    } catch (e) {
      console.error("Failed to persist message", e);
    }
  };

  const fetchDynamicTrackOptions = async (): Promise<string[]> => {
    try {
      const res = await fetch(`/api/chat/suggest-tracks/${params.chatId}`, { method: 'POST' });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.options) ? data.options : [];
    } catch (e) {
      console.error('Failed to get dynamic tracks', e);
      return [];
    }
  };

  const generateRoadmapTodos = (track: string): TodoItem[] => {
    const baseId = Date.now();
    const steps: string[] = (() => {
      const t = track.toLowerCase();
      if (t.includes("node")) {
        return [
          "Learn JavaScript fundamentals",
          "Node.js basics (fs, events, modules)",
          "Build REST APIs with Express",
          "Databases: PostgreSQL or MongoDB",
          "Auth & JWT",
          "Testing (Jest/Supertest)",
          "Deploy (Render/Vercel/Fly.io)",
        ];
      }
      if (t.includes("python")) {
        return [
          "Python fundamentals",
          "Web framework: Django or FastAPI",
          "ORM and migrations",
          "Auth & permissions",
          "APIs and documentation (OpenAPI)",
          "Testing (pytest)",
          "Deploy (Railway/Render)",
        ];
      }
      if (t.includes("spring") || t.includes("java")) {
        return [
          "Java basics",
          "Spring Boot fundamentals",
          "REST APIs & Spring Data JPA",
          "Security (Spring Security/JWT)",
          "Testing (JUnit)",
          "Deploy (Docker + cloud)",
        ];
      }
      return [
        "Understand role requirements",
        "Core language basics",
        "Framework fundamentals",
        "Databases",
        "Auth & security",
        "Testing",
        "Deployment",
      ];
    })();

    return steps.map((text, idx) => ({
      id: (baseId + idx).toString(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    }));
  };

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const userMsg: ChatMessage = { content: message, role: "user" };
      await appendMessage(userMsg);

      let updated: Partial<Roadmap> = {};
      let botReply: string | null = null;

      // Understand user's message to check for small talk or relevant info
      let understood: {
        smallTalk: boolean;
        domain?: string | null;
        goal?: string | null;
        priorKnowledge?: string | null;
        followUp?: string | null;
      } | null = null;
      try {
        const ures = await fetch(`/api/chat/understand/${params.chatId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message }),
        });
        if (ures.ok) {
          const data = await ures.json();
          understood = data.result;
        }
      } catch (e) {
        console.error('understand call failed', e);
      }

      // Determine current question for validation
      let currentQuestion = "";
      if (roadmap && !roadmap.goal) {
        currentQuestion = "What is your final goal? (e.g., Becoming a backend developer)";
      } else if (roadmap && !roadmap.priorKnowledge) {
        currentQuestion = "Do you have any prior knowledge or experience related to this?";
      } else if (roadmap && !roadmap.chosenTrack) {
        currentQuestion = "Which track do you want to choose?";
      }

      // Validate response if we have a current question
      let validation: { relevant: boolean; extractedInfo?: string | null; reason?: string | null } | null = null;
      if (currentQuestion) {
        try {
          const vres = await fetch(`/api/chat/validate/${params.chatId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message, currentQuestion }),
          });
          if (vres.ok) {
            const data = await vres.json();
            validation = data.result;
          }
        } catch (e) {
          console.error('validation call failed', e);
        }
      }

      // Auto-set domain from user session if not already set
      if (roadmap && (!roadmap.domain || roadmap.domain.trim() === "") && session?.user?.domain) {
        updated.domain = session.user.domain;
      }

      // Handle questions sequentially
      if (roadmap && !roadmap.goal) {
        if (understood?.smallTalk || !validation?.relevant || message.trim().length < 5) {
          botReply = `Please provide a clear goal. ${currentQuestion}`;
        } else {
          updated.goal = understood?.goal || message.trim();
          botReply = "Great! Do you have any prior knowledge or experience related to this?";
        }
      } else if (roadmap && !roadmap.priorKnowledge) {
        if (understood?.smallTalk || !validation?.relevant || message.trim().length < 3) {
          botReply = `Please provide details about your prior knowledge. ${currentQuestion}`;
        } else {
          updated.priorKnowledge = understood?.priorKnowledge || message.trim();
          const options = await fetchDynamicTrackOptions();
          botReply = options.length > 0
            ? `There are multiple tracks you could choose: ${options.join(", ")}. Which one do you want?`
            : "Based on your background, there are a few great tracks you could choose. Which specialization are you most interested in?";
        }
      } else if (roadmap && !roadmap.chosenTrack) {
        if (understood?.smallTalk || !validation?.relevant || message.trim().length < 2) {
          botReply = `Please specify a track. ${currentQuestion}`;
        } else {
          updated.chosenTrack = message.trim();
          const todos = generateRoadmapTodos(updated.chosenTrack);
          updated.todoList = todos;
          botReply = "Here is a detailed roadmap. I also created a to-do list above.";
        }
      } else if (roadmap && roadmap.goal && roadmap.priorKnowledge && roadmap.chosenTrack) {
        // All required questions answered, allow general assistance
        try {
          const res = await fetch(`/api/chat/${params.chatId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: message }),
          });
          if (res.ok) {
            const data = await res.json();
            botReply = data.message.content;
          } else {
            botReply = "Noted. I will keep assisting you. Use the to-do list above to track progress.";
          }
        } catch (e) {
          console.error("Gemini chat call failed", e);
          botReply = "Noted. I will keep assisting you. Use the to-do list above to track progress.";
        }
      }

      // Update roadmap if there are changes
      if (Object.keys(updated).length > 0 && roadmap) {
        const res = await fetch(`/api/roadmap/${params.chatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            todoList: updated.todoList ?? roadmap.todoList,
            domain: updated.domain ?? roadmap.domain,
            goal: updated.goal ?? roadmap.goal,
            priorKnowledge: updated.priorKnowledge ?? roadmap.priorKnowledge,
            chosenTrack: updated.chosenTrack ?? roadmap.chosenTrack,
          }),
        });
        if (res.ok) {
          const { roadmap: updatedRoadmap } = await res.json();
          setRoadmap(updatedRoadmap);
        }
      }

      if (botReply) {
        await appendMessage({ content: botReply, role: "bot" });
      }

      setMessage("");
      toast({ title: "Sent" });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleTodo = async (todoId: string) => {
    if (!roadmap) return;

    const updatedTodoList = roadmap.todoList.map(todo =>
    todo.id === todoId ? { ...todo, done: !todo.done } : todo
    );

    try {
      const response = await fetch(`/api/roadmap/${params.chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoList: updatedTodoList })
      });

      if (response.ok) {
        const { roadmap: updatedRoadmap } = await response.json();
        setRoadmap(updatedRoadmap);
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!roadmap) return;

    const updatedTodoList = roadmap.todoList.filter(todo => todo.id !== todoId);

    try {
      const response = await fetch(`/api/roadmap/${params.chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoList: updatedTodoList })
      });

      if (response.ok) {
        const { roadmap: updatedRoadmap } = await response.json();
        setRoadmap(updatedRoadmap);
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
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
      <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-4 sm:py-6 lg:py-8">
            <div>
              <h1 className="text-2xl font-bold">{roadmap?.name}</h1>
              <p className="text-muted-foreground">Domain: {roadmap?.domain}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/roadmap")}> 
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Roadmaps
            </Button>
          </div>

          {/* To-do List Accordion */}
          <Accordion type="single" collapsible value={isTodosOpen ? "todos" : undefined} onValueChange={(v) => setIsTodosOpen(!!v)}>
            <AccordionItem value="todos">
              <AccordionTrigger>To-do list</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mb-2">
                  {roadmap?.todoList.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-2xl mb-2">📋</div>
                      <p className="text-muted-foreground">Your tasks will appear here after picking a track.</p>
                    </div>
                  ) : (
                    roadmap?.todoList.map((todo) => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                      >
                        <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                          {todo.done ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        <span className={`flex-1 ${todo.done ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.text}
                        </span>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Chat Interface */}
          <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-6">
              {/* Messages */}
              <div className="space-y-3 mb-6 max-h-[50vh] overflow-auto pr-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🤖</div>
                    <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                    <p className="text-muted-foreground">
                      I see you're interested in {session?.user?.domain || 'your chosen domain'}. What is your final goal? (e.g., Becoming a backend developer)
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2 rounded-lg border ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} max-w-[80%]`}>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about your roadmap, skills to learn, or next steps..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!message.trim() || isSending}
                  className="flex-shrink-0"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}