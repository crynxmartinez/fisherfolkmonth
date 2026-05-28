"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Fish, Award, Users, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [judgeName, setJudgeName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJudgeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/judge/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: judgeName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("judgeSession", JSON.stringify(data.judge));
      router.push("/judge/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logos */}
        <div className="text-center mb-8 md:mb-12">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="flex items-center gap-4">
              <Image
                src="/barmm-logo.png"
                alt="BARMM Logo"
                width={100}
                height={100}
                className="object-contain w-16 h-16 md:w-24 md:h-24"
              />
              <Image
                src="/mafar-logo.webp"
                alt="MAFAR Logo"
                width={100}
                height={100}
                className="object-contain w-16 h-16 md:w-24 md:h-24 md:hidden"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
                Farmers & Fisherfolk Month
              </h1>
              <h2 className="text-lg md:text-2xl font-semibold text-blue-600">
                Awards Celebration 2026
              </h2>
            </div>
            <Image
              src="/mafar-logo.webp"
              alt="MAFAR Logo"
              width={100}
              height={100}
              className="object-contain w-24 h-24 hidden md:block"
            />
          </div>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Online Judging System for recognizing outstanding contributions in fisheries, 
            aquaculture, and sustainable farming practices.
          </p>
        </div>

        {/* Award Categories Preview */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-12">
          {[
            { icon: Award, title: "Outstanding Fisherfolk", color: "bg-amber-500" },
            { icon: Fish, title: "Innovative Sea Farmer", color: "bg-blue-500" },
            { icon: ShieldCheck, title: "Sustainable Champion", color: "bg-green-500" },
            { icon: Users, title: "Women in Fisheries", color: "bg-pink-500" },
            { icon: Award, title: "Youth Achiever", color: "bg-purple-500" },
          ].map((cat, i) => (
            <div key={i} className="text-center">
              <div className={`${cat.color} p-2 md:p-3 rounded-full w-fit mx-auto mb-1 md:mb-2`}>
                <cat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-700">{cat.title}</p>
            </div>
          ))}
        </div>

        {/* Login Card */}
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Judge Portal</CardTitle>
              <CardDescription className="text-blue-100">
                Enter your name to access the scoring system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleJudgeLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Entering..." : "Start Judging"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <a 
                  href="/admin" 
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Admin Dashboard →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>BARMM Fisherfolk Month Celebration 2026</p>
        </div>
      </div>
    </div>
  );
}
