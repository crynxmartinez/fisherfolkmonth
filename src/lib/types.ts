export interface Criterion {
  name: string;
  weight: number;
  description: string;
}

export interface CategoryWithNominees {
  id: string;
  name: string;
  description: string | null;
  criteria: Criterion[];
  order: number;
  nominees: NomineeWithScores[];
}

export interface NomineeWithScores {
  id: string;
  name: string;
  location: string;
  organization: string | null;
  achievements: string | null;
  photoUrl: string | null;
  categoryId: string;
  scores: ScoreWithJudge[];
}

export interface ScoreWithJudge {
  id: string;
  judgeId: string;
  nomineeId: string;
  ratings: Record<string, number>;
  totalScore: number;
  createdAt: Date;
  judge: {
    id: string;
    code: string;
    name: string | null;
  };
}

export interface JudgeSession {
  id: string;
  code: string;
  name: string | null;
}
