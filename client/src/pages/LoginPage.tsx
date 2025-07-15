"use client"

import type React from "react"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export default function LoginPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login form submitted!")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF5]">
      {" "}
      {/* Changed to flex-col */}
      <header className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
      <Link to="/">
        <div className="flex items-center gap-2">
          <div className="bg-northeasternRed text-white text-xs font-bold px-2 py-1 rounded-md">
            NU
            <br />
            GROUP
            <br />
            FINDER
          </div>
        </div>
        </Link> 
        {/* You can add navigation links or other header elements here if needed */}
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        {" "}
        {/* New wrapper for centering the card */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Log In</CardTitle>
            <CardDescription className="text-gray-600">Enter your email and password to access your account!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full bg-northeasternRed text-white hover:bg-northeasternRed/darker">
                Log In
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-northeasternRed hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
