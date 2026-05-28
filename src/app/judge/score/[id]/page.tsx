"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Building2, Save, CheckCircle } from "lucide-react";
import type { JudgeSession, Criterion } from "@/lib/types";

interface NomineeWithCategory {
  id: string;
  name: string;
  location: string;
  organization: string | null;
  achievements: string | null;
  category: {
    id: string;
    name: string;
    criteria: Criterion[];
  };
  scores: Array<{
    id: string;
    ratings: Record<string, number>;
    totalScore: number;
  }>;
}

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Needs Improvement",
  3: "Satisfactory",
  4: "Very Satisfactory",
  5: "Outstanding",
};

export default function ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [judge, setJudge] = useState<JudgeSession | null>(null);
  const [nominee, setNominee] = useState<NomineeWithCategory | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("judgeSession");
    if (!session) {
      router.push("/");
      return;
    }

    const judgeData = JSON.parse(session) as JudgeSession;
    setJudge(judgeData);

    fetch(`/api/nominees/${id}?judgeId=${judgeData.id}`)
      .then((res) => res.json())
      .then((data) => {
        setNominee(data.nominee);
        
        // Initialize ratings from existing score or defaults
        const criteria = data.nominee.category.criteria as Criterion[];
        const existingScore = data.nominee.scores[0];
        
        const initialRatings: Record<string, number> = {};
        criteria.forEach((c: Criterion) => {
          initialRatings[c.name] = existingScore?.ratings?.[c.name] || 3;
        });
        setRatings(initialRatings);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, router]);

  const calculateTotalScore = () => {
    if (!nominee) return 0;
    const criteria = nominee.category.criteria as Criterion[];
    let total = 0;
    criteria.forEach((c) => {
      const rating = ratings[c.name] || 0;
      total += (rating / 5) * c.weight;
    });
    return total;
  };

  const handleSave = async () => {
    if (!judge || !nominee) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgeId: judge.id,
          nomineeId: nominee.id,
          ratings,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push(`/judge/category/${nominee.category.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving score:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <p className="text-gray-600">Loading nominee...</p>
      </div>
    );
  }

  if (!nominee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <p className="text-gray-600">Nominee not found</p>
      </div>
    );
  }

  const criteria = nominee.category.criteria as Criterion[];
  const totalScore = calculateTotalScore();
  const hasExistingScore = nominee.scores.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/judge/category/${nominee.category.id}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {nominee.category.name}
        </Button>

        {/* Nominee Profile */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {nominee.category.name}
                </Badge>
                <CardTitle className="text-2xl">{nominee.name}</CardTitle>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
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
              {hasExistingScore && (
                <Badge className="bg-blue-100 text-blue-700">
                  Previously Scored
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold text-gray-900 mb-2">Achievements & Background</h4>
            <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
              {nominee.achievements || "No achievements listed."}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Form */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Score This Nominee</CardTitle>
            <CardDescription>
              Rate each criterion from 1 (Poor) to 5 (Outstanding)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {criteria.map((criterion, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-base font-semibold">{criterion.name}</Label>
                    <p className="text-sm text-gray-500">{criterion.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    Weight: {criterion.weight}%
                  </Badge>
                </div>
                <div className="space-y-3">
                  <Slider
                    value={[ratings[criterion.name] || 3]}
                    onValueChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      setRatings((prev) => ({ ...prev, [criterion.name]: val }));
                    }}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 - Poor</span>
                    <span>2</span>
                    <span>3 - Satisfactory</span>
                    <span>4</span>
                    <span>5 - Outstanding</span>
                  </div>
                  <div className="text-center">
                    <Badge
                      className={`${
                        ratings[criterion.name] >= 4
                          ? "bg-green-100 text-green-700"
                          : ratings[criterion.name] >= 3
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      Rating: {ratings[criterion.name]} - {ratingLabels[ratings[criterion.name]]}
                    </Badge>
                  </div>
                </div>
                {index < criteria.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Score Summary & Submit */}
        <Card className="border-0 shadow-lg sticky bottom-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calculated Total Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalScore.toFixed(2)} <span className="text-lg text-gray-400">/ 100</span>
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={saving || saved}
                className={`gap-2 ${saved ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Saved!
                  </>
                ) : saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {hasExistingScore ? "Update Score" : "Submit Score"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
