"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <h1 className="text-5xl font-bold mb-6 text-blue-400">
          Welcome to Kisana
        </h1>
        <p className="text-xl mb-8 text-slate-300 max-w-xl text-center">
          Build powerful AI agents with our intuitive drag-and-drop interface,
          tailored to your unique use cases.
        </p>

        <Link href="/build">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Get Started
          </Button>
        </Link>
      </div>
  )
}