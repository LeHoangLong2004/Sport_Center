import { useState, useEffect } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import type { MockMember } from "../services/api";
import {
  MOCK_ATTENDANCE_HISTORY,
  MOCK_ASSIGNED_WORKOUTS,
} from "./member-profile/types";
import { MemberHeroCard } from "./member-profile/MemberHeroCard";
import { MemberStatsCards } from "./member-profile/MemberStatsCards";
import { MemberHistoryAndWorkouts } from "./member-profile/MemberHistoryAndWorkouts";
import { MemberNotesAndAssessments } from "./member-profile/MemberNotesAndAssessments";

interface Props {
  memberId: string | null;
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

export default function CoachMemberProfile({ memberId, navigateTo }: Props) {
  const [member, setMember] = useState<MockMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState<string[]>([
    "Học viên có ý thức tự giác rất cao, tiếp thu kỹ thuật nhanh và luôn đến đúng giờ.",
    "Động tác Squat và Deadlift đã chuẩn form, cột sống giữ thẳng tự nhiên.",
    "Khuyên học viên chú ý khởi động kỹ khớp cổ tay và bổ sung đủ 2 lít nước mỗi ngày."
  ]);
  const [newNote, setNewNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);

    CoachAPI.getMembers()
      .then((membersData) => {
        const m = membersData.find((x: MockMember) => x.id === memberId) || null;
        if (m) {
          setMember(m);
        } else {
          // Fallback member if id not in list
          setMember({
            id: memberId,
            name: "Member Two",
            code: "MBCBCE",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            goal: "Sức khỏe & Săn chắc cơ",
            level: "Cơ bản",
            sport: "Đa môn",
            phone: "0901234568",
            email: "member2@test.com",
            classIds: ["s1", "s2"]
          });
        }
      })
      .catch(() => {
        setMember({
          id: memberId,
          name: "Member Two",
          code: "MBCBCE",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          goal: "Sức khỏe & Săn chắc cơ",
          level: "Cơ bản",
          sport: "Đa môn",
          phone: "0901234568",
          email: "member2@test.com",
          classIds: ["s1", "s2"]
        });
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote.trim(), ...notes]);
    setNewNote("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-4xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-orange-500 mb-3"></div>
        <p className="text-sm">Đang tải hồ sơ học viên...</p>
      </div>
    );
  }

  if (!member) {
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
      <MemberHeroCard member={member} navigateTo={navigateTo} />

      {/* KPI Cards */}
      <MemberStatsCards />

      {/* Main Grid: Left = Attendance & Workouts | Right = Coach Notes & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MemberHistoryAndWorkouts
          attendanceHistory={MOCK_ATTENDANCE_HISTORY}
          assignedWorkouts={MOCK_ASSIGNED_WORKOUTS}
          navigateTo={navigateTo}
        />

        <MemberNotesAndAssessments
          notes={notes}
          newNote={newNote}
          setNewNote={setNewNote}
          noteSaved={noteSaved}
          onAddNote={handleAddNote}
        />
      </div>
    </div>
  );
}
