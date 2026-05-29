"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Score {
  id: string;
  judgeId: string;
  totalScore: number;
}

interface Nominee {
  id: string;
  name: string;
  location: string;
  organization: string | null;
  scores: Score[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  nominees: Nominee[];
}

interface RankedNominee extends Nominee {
  average: number;
  percentage: number;
  rank: number;
}

export default function ResultsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        setLoading(false);
      });
  }, []);

  const getRankedNominees = (category: Category): RankedNominee[] => {
    const nomineesWithStats = category.nominees.map((nominee) => {
      const totalScore = nominee.scores.reduce((sum, s) => sum + s.totalScore, 0);
      const average = nominee.scores.length > 0 ? totalScore / nominee.scores.length : 0;
      return {
        ...nominee,
        average,
        percentage: average, // Score is already out of 100
        rank: 0,
      };
    });

    // Sort by average descending
    nomineesWithStats.sort((a, b) => b.average - a.average);

    // Assign ranks
    nomineesWithStats.forEach((nominee, index) => {
      nominee.rank = index + 1;
    });

    return nomineesWithStats;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Link href="/admin" className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-4">
            <Image
              src="/barmm-logo.png"
              alt="BARMM Logo"
              width={100}
              height={100}
              className="object-contain w-16 h-16 md:w-24 md:h-24"
            />
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">
                🏆 Awards Winners 🏆
              </h1>
              <h2 className="text-lg md:text-2xl font-semibold text-amber-600">
                Fisherfolk Month 2026
              </h2>
            </div>
            <Image
              src="/mafar-logo.webp"
              alt="MAFAR Logo"
              width={100}
              height={100}
              className="object-contain w-16 h-16 md:w-24 md:h-24"
            />
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Celebrating Excellence in Fisheries & Aquaculture
          </p>
        </div>

        {/* Results by Category */}
        <div className="space-y-8">
          {categories.map((category) => {
            const rankedNominees = getRankedNominees(category);
            const hasScores = rankedNominees.some((n) => n.scores.length > 0);

            return (
              <Card key={category.id} className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {!hasScores ? (
                    <p className="text-center text-gray-500 py-8">
                      No scores submitted yet for this category.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {rankedNominees.map((nominee) => (
                        <div
                          key={nominee.id}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            nominee.rank === 1
                              ? "bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400"
                              : nominee.rank === 2
                              ? "bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300"
                              : nominee.rank === 3
                              ? "bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          {/* Rank Badge */}
                          <div className="flex-shrink-0">
                            {nominee.rank === 1 ? (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
                              </div>
                            ) : nominee.rank === 2 ? (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-lg">
                                <Medal className="w-6 h-6 md:w-8 md:h-8 text-white" />
                              </div>
                            ) : nominee.rank === 3 ? (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg">
                                <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-500">
                                  {nominee.rank}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Nominee Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {nominee.rank === 1 && (
                                <Badge className="bg-amber-500 text-xs">🥇 1st Place</Badge>
                              )}
                              {nominee.rank === 2 && (
                                <Badge className="bg-gray-400 text-xs">🥈 2nd Place</Badge>
                              )}
                              {nominee.rank === 3 && (
                                <Badge className="bg-orange-500 text-xs">🥉 3rd Place</Badge>
                              )}
                            </div>
                            <h3 className={`font-bold truncate ${
                              nominee.rank <= 3 ? "text-lg md:text-xl" : "text-base"
                            }`}>
                              {nominee.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {nominee.location}
                              {nominee.organization && ` • ${nominee.organization}`}
                            </p>
                          </div>

                          {/* Score */}
                          <div className="flex-shrink-0 text-right">
                            <div className={`font-bold ${
                              nominee.rank === 1
                                ? "text-2xl md:text-3xl text-amber-600"
                                : nominee.rank === 2
                                ? "text-xl md:text-2xl text-gray-600"
                                : nominee.rank === 3
                                ? "text-xl md:text-2xl text-orange-600"
                                : "text-lg text-gray-500"
                            }`}>
                              {nominee.scores.length > 0 ? `${nominee.percentage.toFixed(1)}%` : "-"}
                            </div>
                            <p className="text-xs text-gray-500">
                              {nominee.scores.length} judge{nominee.scores.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>BARMM Fisherfolk Month Celebration 2026</p>
          <p className="mt-1">Ministry of Agriculture, Fisheries and Agrarian Reform</p>
        </div>
      </div>
    </div>
  );
}
