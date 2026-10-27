import { useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MemberProfileData } from "./member-profile/types";
import { MemberHeroCard } from "./member-profile/MemberHeroCard";
import { MemberStatsCards } from "./member-profile/MemberStatsCards";
import { MemberHistoryAndWorkouts } from "./member-profile/MemberHistoryAndWorkouts";
import { MemberNotesAndAssessments } from "./member-profile/MemberNotesAndAssessments";

interface Props {
  memberId: string | null;
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

export default function CoachMemberProfile({ memberId, navigateTo }: Props) {
  const [profile, setProfile] = useState<MemberProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState<MemberProfileData["notes"]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);

    CoachAPI.getMemberProfile(memberId)
      .then((data) => {
        setProfile(data);
        setNotes(data.notes);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    if (!memberId) return;
    const saved = await CoachAPI.saveMemberNote(memberId, { comment: newNote.trim() });
    setNotes((current) => [{
      id: saved.id,
      comment: saved.comment,
      nextStep: "",
      completion: saved.completion ?? 0,
      createdAt: saved.createdAt,
    }, ...current]);
    setNewNote("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleVerifyWorkout = async (
    homeworkId: string,
    status: "completed" | "rejected",
    notes?: string
  ) => {
    try {
      await CoachAPI.verifyWorkout(homeworkId, { status, notes });
      if (memberId) {
        const updated = await CoachAPI.getMemberProfile(memberId);
        setProfile(updated);
      }
    } catch (err) {
      console.error("Failed to verify workout", err);
    }
  };

  const handleAddFitnessTest = async (data: {
    metricName: string;
    value: number;
    unit: string;
    effort?: number;
    comment?: string;
    nextStep?: string;
  }) => {
    if (!memberId) return;
    await CoachAPI.saveFitnessTest(memberId, data);
    const updated = await CoachAPI.getMemberProfile(memberId);
    setProfile(updated);
    setNotes(updated.notes);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-4xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-orange-500 mb-3"></div>
        <p className="text-sm">Đang tải hồ sơ học viên...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 max-w-4xl mx-auto">
        <p>Không tìm thấy học viên trong hệ thống.</p>
        <button
          type="button"
          className="text-orange-600 hover:underline text-sm font-semibold"
          onClick={() => navigateTo("members")}
        >
          ← Quay lại danh sách học viên
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top back navigation & Hero Profile Card */}
      <MemberHeroCard member={profile.member} navigateTo={navigateTo} />

      {/* KPI Cards */}
      <MemberStatsCards stats={profile.stats} />

      {/* Main Grid: Left = Attendance & Workouts | Right = Coach Notes & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MemberHistoryAndWorkouts
          memberId={memberId}
          attendanceHistory={profile.attendanceHistory}
          assignedWorkouts={profile.assignedWorkouts}
          attendanceRate={profile.stats.attendanceRate}
          navigateTo={navigateTo}
          onVerifyWorkout={handleVerifyWorkout}
        />

        <MemberNotesAndAssessments
          notes={notes}
          newNote={newNote}
          setNewNote={setNewNote}
          noteSaved={noteSaved}
          onAddNote={handleAddNote}
          fitnessTests={profile.fitnessTests}
          onAddFitnessTest={handleAddFitnessTest}
        />
      </div>
    </div>
  );
}
