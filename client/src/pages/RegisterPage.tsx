"use client"

import type React from "react"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export default function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register form submitted!")
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
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        {" "}
        {/* New wrapper for centering the card */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Sign Up</CardTitle>
            <CardDescription className="text-gray-600">Create your account to get started!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required />
              </div>
              <Button type="submit" className="w-full bg-northeasternRed text-white hover:bg-northeasternRed/darker">
                Sign Up
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-northeasternRed hover:underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
