import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CareerPath - Your AI Career Mentor",
  description: "AI-powered career mentor that creates personalized roadmaps and connects students to the right opportunities.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
