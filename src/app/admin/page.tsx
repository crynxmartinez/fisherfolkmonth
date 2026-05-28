"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fish, Trophy, Users, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Judge {
  id: string;
  code: string;
  name: string | null;
}

interface Criterion {
  name: string;
  weight: number;
}

interface Score {
  id: string;
  judgeId: string;
  totalScore: number;
  judge: Judge;
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
  criteria: Criterion[];
  nominees: Nominee[];
}

export default function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/admin/judges").then((res) => res.json()),
    ])
      .then(([catData, judgeData]) => {
        setCategories(catData.categories);
        setJudges(judgeData.judges);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const calculateNomineeStats = (nominee: Nominee) => {
    if (nominee.scores.length === 0) {
      return { average: 0, count: 0 };
    }
    const total = nominee.scores.reduce((acc, s) => acc + s.totalScore, 0);
    return {
      average: total / nominee.scores.length,
      count: nominee.scores.length,
    };
  };

  const getRankedNominees = (category: Category) => {
    return [...category.nominees]
      .map((n) => ({
        ...n,
        stats: calculateNomineeStats(n),
      }))
      .sort((a, b) => b.stats.average - a.stats.average);
  };

  const exportToCSV = () => {
    let csv = "Category,Rank,Nominee,Location,Organization,Average Score,Judges Scored\n";
    
    categories.forEach((category) => {
      const ranked = getRankedNominees(category);
      ranked.forEach((nominee, index) => {
        csv += `"${category.name}",${index + 1},"${nominee.name}","${nominee.location}","${nominee.organization || ""}",${nominee.stats.average.toFixed(2)},${nominee.stats.count}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fisherfolk_awards_results.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <Fish className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const totalNominees = categories.reduce((acc, c) => acc + c.nominees.length, 0);
  const totalScores = categories.reduce(
    (acc, c) => acc + c.nominees.reduce((a, n) => a + n.scores.length, 0),
    0
  );
  const expectedScores = totalNominees * judges.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logos */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Image
              src="/barmm-logo.png"
              alt="BARMM Logo"
              width={60}
              height={60}
              className="object-contain w-10 h-10 md:w-14 md:h-14"
            />
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-xs md:text-sm flex items-center gap-1 mb-1">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                Back to Home
              </Link>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs md:text-base text-gray-600 mt-1">
                Fisherfolk Month Awards 2026
              </p>
            </div>
            <Image
              src="/mafar-logo.webp"
              alt="MAFAR Logo"
              width={60}
              height={60}
              className="object-contain w-10 h-10 md:w-14 md:h-14"
            />
          </div>
          <Button onClick={exportToCSV} className="gap-2 bg-green-600 hover:bg-green-700 w-full md:w-auto">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-4 md:gap-4 md:mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-blue-100 p-2 md:p-3 rounded-xl">
                  <Trophy className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{categories.length}</p>
                  <p className="text-xs md:text-sm text-gray-600">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-amber-100 p-2 md:p-3 rounded-xl">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{totalNominees}</p>
                  <p className="text-xs md:text-sm text-gray-600">Nominees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-green-100 p-2 md:p-3 rounded-xl">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{judges.length}</p>
                  <p className="text-xs md:text-sm text-gray-600">Judges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-purple-100 p-2 md:p-3 rounded-xl">
                  <Fish className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {totalScores}/{expectedScores}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">Scores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Results by Category</CardTitle>
            <CardDescription className="text-xs md:text-sm">Rankings based on average judge scores</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <Tabs defaultValue={categories[0]?.id}>
              <TabsList className="mb-4 flex-wrap h-auto gap-1 md:gap-2 w-full justify-start">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-[10px] md:text-xs px-2 py-1">
                    {category.name.replace("Most ", "").replace("Outstanding ", "").replace(" in Fisheries & Aquaculture", "")}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => {
                const rankedNominees = getRankedNominees(category);

                return (
                  <TabsContent key={category.id} value={category.id}>
                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3">
                      {rankedNominees.map((nominee, index) => (
                        <div key={nominee.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {index === 0 && nominee.stats.count > 0 ? (
                                  <Badge className="bg-amber-500 text-xs">🥇</Badge>
                                ) : index === 1 && nominee.stats.count > 0 ? (
                                  <Badge className="bg-gray-400 text-xs">🥈</Badge>
                                ) : index === 2 && nominee.stats.count > 0 ? (
                                  <Badge className="bg-amber-700 text-xs">🥉</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                                )}
                              </div>
                              <p className="font-semibold text-base">{nominee.name}</p>
                              <p className="text-xs text-gray-500">{nominee.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Average</p>
                              <p className="text-xl font-bold text-blue-600">
                                {nominee.stats.count > 0 ? nominee.stats.average.toFixed(1) : "-"}
                              </p>
                            </div>
                          </div>
                          {judges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                              {judges.map((judge, idx) => {
                                const score = nominee.scores.find((s) => s.judgeId === judge.id);
                                return (
                                  <div key={judge.id} className="text-center bg-white px-3 py-1 rounded border">
                                    <p className="text-[10px] text-gray-500">J{idx + 1}</p>
                                    <p className="text-sm font-semibold">{score ? score.totalScore.toFixed(0) : "-"}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Rank</TableHead>
                            <TableHead>Nominee</TableHead>
                            <TableHead>Location</TableHead>
                            {judges.map((judge, idx) => (
                              <TableHead key={judge.id} className="text-center w-24">
                                <div className="text-xs">
                                  <div className="font-semibold">Judge {idx + 1}</div>
                                  {judge.name && (
                                    <div className="text-gray-500 font-normal truncate max-w-20">
                                      {judge.name}
                                    </div>
                                  )}
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="text-center">Average</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rankedNominees.map((nominee, index) => (
                            <TableRow key={nominee.id}>
                              <TableCell>
                                {index === 0 && nominee.stats.count > 0 ? (
                                  <Badge className="bg-amber-500">🥇 1st</Badge>
                                ) : index === 1 && nominee.stats.count > 0 ? (
                                  <Badge className="bg-gray-400">🥈 2nd</Badge>
                                ) : index === 2 && nominee.stats.count > 0 ? (
                                  <Badge className="bg-amber-700">🥉 3rd</Badge>
                                ) : (
                                  <span className="text-gray-500">{index + 1}</span>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{nominee.name}</TableCell>
                              <TableCell className="text-gray-600">{nominee.location}</TableCell>
                              {judges.map((judge) => {
                                const score = nominee.scores.find((s) => s.judgeId === judge.id);
                                return (
                                  <TableCell key={judge.id} className="text-center">
                                    {score ? (
                                      <span className="font-medium">{score.totalScore.toFixed(1)}</span>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center">
                                <Badge
                                  variant={nominee.stats.count > 0 ? "default" : "secondary"}
                                  className={
                                    nominee.stats.count > 0
                                      ? "bg-blue-600"
                                      : ""
                                  }
                                >
                                  {nominee.stats.count > 0
                                    ? nominee.stats.average.toFixed(2)
                                    : "N/A"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
