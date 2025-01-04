import * as React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Link from "next/link"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
        <head>
            <title>Kisana – AI Agent Builder</title>
            <meta name="description" content="Build powerful AI Agents with our intuitive drag-and-drop builder" />
        </head>
        <body
            className={cn(
                inter.className,
                "min-h-screen bg-slate-900 text-slate-100"
            )}
        >
        <div className="flex flex-col min-h-screen">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <nav className="flex items-center space-x-4 lg:space-x-6">
                        <Link
                            href="/"
                            className="text-sm font-medium transition-colors hover:text-blue-400"
                        >
                            Home
                        </Link>
                        <Link
                            href="/build"
                            className="text-sm font-medium transition-colors hover:text-blue-400"
                        >
                            Build
                        </Link>
                        <Link
                            href="/manage"
                            className="text-sm font-medium transition-colors hover:text-blue-400"
                        >
                            Manage
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
        </div>
        </body>
        </html>
    )
}
