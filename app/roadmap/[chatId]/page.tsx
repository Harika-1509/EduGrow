"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, CheckCircle, Circle, Trash2 } from "lucide-react";

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
  userId: string;
  todoList: TodoItem[];
  createdAt: string;
  updatedAt: string;
}

export default function RoadmapChatPage({ params }: { params: { chatId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    if (status === "authenticated") {
      fetchRoadmap();
    }
  }, [status, router]);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch(`/api/roadmap/${params.chatId}`);
      if (response.ok) {
        const { roadmap } = await response.json();
        setRoadmap(roadmap);
      } else {
        router.push("/roadmap");
      }
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
      router.push("/roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      // For now, we'll just add a simple todo item
      // In the future, this could integrate with AI to generate roadmap items
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: message,
        done: false,
        createdAt: new Date().toISOString()
      };

      const updatedTodoList = [...(roadmap?.todoList || []), newTodo];
      
      const response = await fetch(`/api/roadmap/${params.chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoList: updatedTodoList })
      });

      if (response.ok) {
        const { roadmap: updatedRoadmap } = await response.json();
        setRoadmap(updatedRoadmap);
        setMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
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

          {/* Chat Interface */}
          <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-6">
              {/* Todo List */}
              <div className="space-y-4 mb-6">
                {roadmap?.todoList.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                    <p className="text-muted-foreground">
                      Ask me anything about your {roadmap?.domain} roadmap. I'll help you create a personalized learning path.
                    </p>
                  </div>
                ) : (
                  roadmap?.todoList.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="flex-shrink-0"
                      >
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
