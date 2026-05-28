"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fish, Award, Users, ShieldCheck, CheckCircle, Clock, LogOut } from "lucide-react";
import type { JudgeSession, CategoryWithNominees } from "@/lib/types";

const categoryIcons: Record<number, typeof Award> = {
  1: Award,
  2: Fish,
  3: ShieldCheck,
  4: Users,
  5: Award,
};

const categoryColors: Record<number, string> = {
  1: "bg-amber-500",
  2: "bg-blue-500",
  3: "bg-green-500",
  4: "bg-pink-500",
  5: "bg-purple-500",
};

export default function JudgeDashboard() {
  const [judge, setJudge] = useState<JudgeSession | null>(null);
  const [categories, setCategories] = useState<CategoryWithNominees[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("judgeSession");
    if (!session) {
      router.push("/");
      return;
    }

    const judgeData = JSON.parse(session) as JudgeSession;
    setJudge(judgeData);

    fetch(`/api/categories?judgeId=${judgeData.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("judgeSession");
    router.push("/");
  };

  const getCategoryProgress = (category: CategoryWithNominees) => {
    const totalNominees = category.nominees.length;
    const scoredNominees = category.nominees.filter(
      (n) => n.scores.length > 0
    ).length;
    return { scored: scoredNominees, total: totalNominees };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <Fish className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalNominees = categories.reduce((acc, c) => acc + c.nominees.length, 0);
  const totalScored = categories.reduce(
    (acc, c) => acc + c.nominees.filter((n) => n.scores.length > 0).length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Judge Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome, <span className="font-semibold">{judge?.name}</span> ({judge?.code})
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                <p className="text-gray-600">
                  You have scored {totalScored} of {totalNominees} nominees
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round((totalScored / totalNominees) * 100)}%
                </div>
                <p className="text-sm text-gray-500">Complete</p>
              </div>
            </div>
            <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(totalScored / totalNominees) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Award Categories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[index + 1] || Award;
            const color = categoryColors[index + 1] || "bg-gray-500";
            const progress = getCategoryProgress(category);
            const isComplete = progress.scored === progress.total;

            return (
              <Card
                key={category.id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/judge/category/${category.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`${color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isComplete ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{category.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {progress.scored} / {progress.total} nominees scored
                    </span>
                    <span className="font-semibold text-blue-600">
                      {Math.round((progress.scored / progress.total) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? "bg-green-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${(progress.scored / progress.total) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
