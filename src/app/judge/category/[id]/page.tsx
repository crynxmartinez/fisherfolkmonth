"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Building2, CheckCircle, Clock, ChevronRight } from "lucide-react";
import type { JudgeSession, CategoryWithNominees, Criterion } from "@/lib/types";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [judge, setJudge] = useState<JudgeSession | null>(null);
  const [category, setCategory] = useState<CategoryWithNominees | null>(null);
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

    fetch(`/api/categories/${id}?judgeId=${judgeData.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCategory(data.category);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <p className="text-gray-600">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <p className="text-gray-600">Category not found</p>
      </div>
    );
  }

  const criteria = category.criteria as Criterion[];
  const scoredCount = category.nominees.filter((n) => n.scores.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/judge/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-gray-600 mt-2">{category.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="secondary">
              {scoredCount} / {category.nominees.length} scored
            </Badge>
          </div>
        </div>

        {/* Scoring Criteria */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Scoring Criteria</CardTitle>
            <CardDescription>
              Rate each nominee from 1-5 based on these criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{criterion.name}</span>
                    <Badge variant="outline">{criterion.weight}%</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nominees List */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nominees</h2>
        <div className="space-y-4">
          {category.nominees.map((nominee) => {
            const isScored = nominee.scores.length > 0;
            const score = isScored ? nominee.scores[0].totalScore : null;

            return (
              <Card
                key={nominee.id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/judge/score/${nominee.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {nominee.name}
                        </h3>
                        {isScored ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Scored: {score?.toFixed(1)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {nominee.location}
                        </span>
                        {nominee.organization && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {nominee.organization}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
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
