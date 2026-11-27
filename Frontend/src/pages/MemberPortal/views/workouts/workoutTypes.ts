export interface HomeworkExercise {
  id?: string;
  name: string;
  reps?: string | null;
  sets?: string | null;
  duration?: string | null;
  rest?: string | null;
  note?: string | null;
  order?: number;
}

export interface HomeworkPlan {
  id: string;
  planName: string;
  planType?: "training_plan" | "homework" | string;
  description?: string | null;
  goal?: string | null;
  level?: string | null;
  durationMinutes?: number | null;
  exercises: HomeworkExercise[];
}

export interface MemberHomework {
  id: string;
  memberId: string;
  planId: string;
  assignedBy?: string | null;
  status: string;
  progressPct?: number | null;
  completedExerciseIds?: string[];
  assignedDate: string;
  dueDate?: string | null;
  notes?: string | null;
  plan?: HomeworkPlan | null;
}

export interface HomeworkTask {
  id: string;
  homeworkId: string;
  exerciseIndex: number;
  title: string;
  description: string;
  dueDate?: string | null;
  assignedDate: string;
  completed: boolean;
}

export function cleanWorkoutPlanName(name?: string | null): string {
  const cleaned = (name || "").replace(/^giáo\s*án\s*/i, "").trim();
  return cleaned || name || "Bài tập rèn luyện";
}
