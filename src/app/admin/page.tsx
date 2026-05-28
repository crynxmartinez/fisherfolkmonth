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
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Fisherfolk Month Awards 2026 - Results Overview
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalNominees}</p>
                  <p className="text-sm text-gray-600">Nominees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{judges.length}</p>
                  <p className="text-sm text-gray-600">Judges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Fish className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalScores} / {expectedScores}
                  </p>
                  <p className="text-sm text-gray-600">Scores Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Judges Status */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Judges Status</CardTitle>
            <CardDescription>Overview of judge participation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-7 gap-4">
              {judges.map((judge) => {
                const judgeScores = categories.reduce(
                  (acc, c) =>
                    acc +
                    c.nominees.reduce(
                      (a, n) => a + n.scores.filter((s) => s.judgeId === judge.id).length,
                      0
                    ),
                  0
                );
                const progress = (judgeScores / totalNominees) * 100;

                return (
                  <div key={judge.id} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{judge.code}</p>
                    <p className="text-xs text-gray-500 truncate">{judge.name || "Not logged in"}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress === 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {judgeScores}/{totalNominees}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Results by Category</CardTitle>
            <CardDescription>Rankings based on average judge scores</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={categories[0]?.id}>
              <TabsList className="mb-4 flex-wrap h-auto gap-2">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.name.replace("Most ", "").replace("Outstanding ", "")}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => {
                const rankedNominees = getRankedNominees(category);

                return (
                  <TabsContent key={category.id} value={category.id}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Nominee</TableHead>
                          <TableHead>Location</TableHead>
                          {judges.map((judge) => (
                            <TableHead key={judge.id} className="text-center w-20">
                              {judge.code.replace("JUDGE-", "J")}
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
