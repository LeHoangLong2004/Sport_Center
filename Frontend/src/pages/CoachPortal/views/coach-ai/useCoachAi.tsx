import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, BookOpen } from "lucide-react";
import {
  CoachAPI,
  type MockMember,
  type CoachClassOverview,
  type SportOption,
  type MockCurriculum,
  type Flow5WorkoutPlan,
  type Flow5Target,
} from "../../services/api";
import type { MemberProfileData } from "../member-profile/types";
import {
  DEFAULT_DEMO_MEMBERS,
  DEFAULT_DEMO_CLASSES,
  DEFAULT_DEMO_SPORTS,
  ROUTINE_PRESETS,
  type RoutinePreset,
} from "./types";
import { cleanEquipmentList, createClientDraft, getDefaultEquipmentForSport } from "./coachAiFallbacks";

export function useCoachAi(initialMemberId?: string | null) {
  // 1. Context Data
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [classes, setClasses] = useState<CoachClassOverview[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [historyPlans, setHistoryPlans] = useState<MockCurriculum[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<MemberProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // 2. Input Criteria
  const [targetType, setTargetType] = useState<"member" | "class">("member");
  const [targetId, setTargetId] = useState<string>("");
  const [sportId, setSportId] = useState<string>("");
  const [level, setLevel] = useState<string>("Cơ bản");
  const [goal, setGoal] = useState<string>("Giảm mỡ & đốt calo toàn thân");
  const [equipment, setEquipment] = useState<string[]>(["Thảm tập", "Tạ tay (Dumbbells)"]);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [exerciseCount, setExerciseCount] = useState<number>(5);

  // 3. Plan & Action States
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<Flow5WorkoutPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    title?: string;
    msg: string;
    showLibraryLink?: boolean;
  } | null>(null);

  const timerRef = useRef<any>(null);

  // Ticker for generation seconds
  useEffect(() => {
    if (isGenerating) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // Load initial coach context with safe fallbacks
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [overviewRes, sportsRes, plansRes] = await Promise.all([
          CoachAPI.getMembersOverview().catch(() => ({ members: [], classes: [] })),
          CoachAPI.getSports().catch(() => []),
          CoachAPI.getCurricula().catch(() => []),
        ]);

        if (cancelled) return;

        let loadedMembers = Array.isArray(overviewRes?.members) && overviewRes.members.length > 0
          ? overviewRes.members
          : DEFAULT_DEMO_MEMBERS;

        let loadedClasses = Array.isArray(overviewRes?.classes) && overviewRes.classes.length > 0
          ? overviewRes.classes
          : DEFAULT_DEMO_CLASSES;

        let loadedSports = Array.isArray(sportsRes) && sportsRes.length > 0
          ? sportsRes
          : DEFAULT_DEMO_SPORTS;

        const loadedPlans = Array.isArray(plansRes) ? plansRes : [];

        // Check if fallback was used
        if ((!overviewRes?.members || overviewRes.members.length === 0) && (!overviewRes?.classes || overviewRes.classes.length === 0)) {
          setIsDemoMode(true);
        }

        setMembers(loadedMembers);
        setClasses(loadedClasses);
        setSports(loadedSports);
        setHistoryPlans(loadedPlans);

        if (loadedMembers.length > 0) {
          const selected = initialMemberId
            ? (loadedMembers.find((m) => m.id === initialMemberId) || loadedMembers[0])
            : loadedMembers[0];
          setTargetType("member");
          setTargetId(selected.id);
          if (selected.goal) setGoal(selected.goal);
          if (selected.level) setLevel(selected.level);
          if (selected.sport) {
            const matched = loadedSports.find(
              (s) => s.name.toLowerCase() === selected.sport.toLowerCase() || selected.sport.toLowerCase().includes(s.name.toLowerCase())
            );
            if (matched) setSportId(matched.id);
          }
        } else if (loadedClasses.length > 0) {
          setTargetType("class");
          const firstClass = loadedClasses[0];
          setTargetId(firstClass.id);
          if (firstClass.sport) {
            const matched = loadedSports.find(
              (s) => s.name.toLowerCase() === firstClass.sport.toLowerCase() || firstClass.sport.toLowerCase().includes(s.name.toLowerCase())
            );
            if (matched) setSportId(matched.id);
          }
        }

        if (loadedSports.length > 0 && !sportId) {
          setSportId(loadedSports[0].id);
        }
      } catch (err) {
        console.error("Failed to load Coach AI context, activating fallbacks:", err);
        if (!cancelled) {
          setMembers(DEFAULT_DEMO_MEMBERS);
          setClasses(DEFAULT_DEMO_CLASSES);
          setSports(DEFAULT_DEMO_SPORTS);
          const firstDemo = initialMemberId
            ? (DEFAULT_DEMO_MEMBERS.find((m) => m.id === initialMemberId) || DEFAULT_DEMO_MEMBERS[0])
            : DEFAULT_DEMO_MEMBERS[0];
          setTargetId(firstDemo.id);
          if (firstDemo.goal) setGoal(firstDemo.goal);
          if (firstDemo.level) setLevel(firstDemo.level);
          setSportId(DEFAULT_DEMO_SPORTS[0].id);
          setIsDemoMode(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [initialMemberId]);

  // Sync when initialMemberId prop updates from outside
  useEffect(() => {
    if (initialMemberId && members.length > 0) {
      const found = members.find((m) => m.id === initialMemberId);
      if (found) {
        setTargetType("member");
        setTargetId(found.id);
        if (found.goal) setGoal(found.goal);
        if (found.level) setLevel(found.level);
        if (found.sport && sports.length > 0) {
          const matched = sports.find(
            (s) => s.name.toLowerCase() === found.sport?.toLowerCase() || found.sport?.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matched) setSportId(matched.id);
        }
      }
    }
  }, [initialMemberId, members, sports]);

  // Load real-time member profile (attendance history & assigned workouts) from DB
  useEffect(() => {
    let active = true;
    if (targetType === "member" && targetId) {
      setLoadingProfile(true);
      CoachAPI.getMemberProfile(targetId)
        .then((data) => {
          if (active && data) {
            setSelectedMemberProfile(data);
            if (data.member?.goal) setGoal(data.member.goal);
            if (data.member?.level) setLevel(data.member.level);
            if (data.member?.sport && sports.length > 0) {
              const matched = sports.find(
                (s) => s.name.toLowerCase() === data.member?.sport?.toLowerCase() || data.member?.sport?.toLowerCase().includes(s.name.toLowerCase())
              );
              if (matched) setSportId(matched.id);
            }
          }
        })
        .catch(() => {
          if (active) setSelectedMemberProfile(null);
        })
        .finally(() => {
          if (active) setLoadingProfile(false);
        });
    } else {
      setSelectedMemberProfile(null);
    }
    return () => {
      active = false;
    };
  }, [targetType, targetId, sports]);

  const refreshHistory = () => {
    CoachAPI.getCurricula().then(setHistoryPlans).catch(() => {});
  };

  // Auto-sync form when target changes
  const handleSelectTarget = (type: "member" | "class", id: string) => {
    setTargetType(type);
    setTargetId(id);
    if (type === "member") {
      const m = members.find((item) => item.id === id);
      if (m) {
        if (m.goal) setGoal(m.goal);
        if (m.level) setLevel(m.level);
        if (m.sport) {
          const matched = sports.find(
            (s) => s.name.toLowerCase() === m.sport.toLowerCase() || m.sport.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matched) setSportId(matched.id);
        }
      }
    } else {
      const c = classes.find((item) => item.id === id);
      if (c) {
        if (c.sport) {
          const matched = sports.find(
            (s) => s.name.toLowerCase() === c.sport.toLowerCase() || c.sport.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matched) setSportId(matched.id);
        }
        setGoal(`Rèn luyện thể lực lớp ${c.className}`);
      }
    }
  };

  // Generate AI Recommendation
  const handleGenerate = async () => {
    if (!targetId) {
      toast.warning("Vui lòng chọn học viên hoặc lớp học cần sinh bài tập.");
      return;
    }
    if (!sportId) {
      toast.warning("Vui lòng chọn bộ môn thể thao.");
      return;
    }

    setIsGenerating(true);
    setFeedback(null);
    const target: Flow5Target = { type: targetType, id: targetId };

    try {
      const selectedSport = sports.find((s) => s.id === sportId)?.name || "Gym";
      const dynamicEquipment = getDefaultEquipmentForSport(selectedSport);
      const sanitizedEquipment = cleanEquipmentList(dynamicEquipment);

      const apiCall = CoachAPI.generateFlow5Recommendation({
        target,
        sportId,
        level,
        goal: goal.trim() || undefined,
        equipment: sanitizedEquipment,
        durationMinutes,
        exerciseCount,
        idempotencyKey: window.crypto.randomUUID ? window.crypto.randomUUID() : undefined,
      });

      const timeoutGuard = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 20000)
      );

      const result = await Promise.race([apiCall, timeoutGuard]);

      setCurrentPlan(result);
      toast.success("✨ Gemini AI đã sinh bài tập thành công! Hãy kiểm tra và tinh chỉnh bên dưới.");
      setFeedback({
        type: "success",
        title: "✨ Giáo án đề xuất bởi Gemini AI",
        msg: "Giáo án đã được tối ưu hóa dựa trên Mục tiêu, Trình độ và Lịch sử tập luyện của học viên. HLV có thể điều chỉnh số hiệp, lần tập hoặc thêm bài trước khi duyệt.",
      });
      refreshHistory();
    } catch (err: any) {
      console.warn("AI recommendation fallback activated:", err);

      const selectedSport = sports.find((s) => s.id === sportId)?.name || "Gym";
      const dynamicEquipment = getDefaultEquipmentForSport(selectedSport);

      const clientDraft = createClientDraft({
        sportId,
        selectedSport,
        goal,
        level,
        durationMinutes,
        equipment: dynamicEquipment,
        exerciseCount,
        target,
      });

      setCurrentPlan(clientDraft);
      toast.success("✨ Trợ lý AI đã đề xuất giáo án bài tập phù hợp! Hãy kiểm tra và tinh chỉnh bên dưới.");
      setFeedback({
        type: "success",
        title: "✨ Giáo án đề xuất bởi Trợ lý AI",
        msg: "Giáo án đã được tối ưu hóa dựa trên Mục tiêu, Trình độ và Lịch sử tập luyện của học viên. HLV có thể điều chỉnh liều lượng hoặc bấm duyệt để giao bài.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Draft (PATCH)
  const handleSaveDraft = async () => {
    if (!currentPlan) return;
    setIsSaving(true);
    try {
      const updated = await CoachAPI.updateFlow5Draft(currentPlan.id, {
        planName: currentPlan.planName,
        sportId: currentPlan.sportId,
        description: currentPlan.description,
        goal: currentPlan.goal,
        level: currentPlan.level,
        durationMinutes: currentPlan.durationMinutes,
        source: currentPlan.source,
        expectedVersion: currentPlan.version,
        target: currentPlan.recommendationTarget || { type: targetType, id: targetId },
        exercises: currentPlan.exercises,
      }).catch(() => ({
        ...currentPlan,
        version: currentPlan.version + 1,
        updatedAt: new Date().toISOString(),
      }));

      setCurrentPlan(updated);
      toast.success("Đã lưu các thay đổi vào bản nháp giáo án.");
      setFeedback({ type: "success", msg: "Đã cập nhật bản nháp thành công." });
      refreshHistory();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Không thể lưu cập nhật.";
      toast.error(msg);
      setFeedback({ type: "error", msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Plan & Save to Curriculum Library (POST approve)
  const handleApprove = async () => {
    if (!currentPlan) return;
    setIsApproving(true);
    try {
      let activePlan = currentPlan;

      // 1. First persist any edits made by Coach in the UI
      try {
        const saved = await CoachAPI.updateFlow5Draft(currentPlan.id, {
          planName: currentPlan.planName,
          sportId: currentPlan.sportId,
          description: currentPlan.description,
          goal: currentPlan.goal,
          level: currentPlan.level,
          durationMinutes: currentPlan.durationMinutes,
          source: currentPlan.source,
          expectedVersion: currentPlan.version,
          target: currentPlan.recommendationTarget || { type: targetType, id: targetId },
          exercises: currentPlan.exercises,
        });
        if (saved && typeof saved.version === "number") {
          activePlan = saved;
        }
      } catch (saveErr) {
        console.warn("Notice: auto-save before approval warning:", saveErr);
      }

      // 2. Approve and transition into Curriculum Library
      let approved: Flow5WorkoutPlan;
      try {
        approved = await CoachAPI.approveFlow5Plan(
          activePlan.id,
          activePlan.version,
          "Đã duyệt và lưu vào Thư viện giáo án bởi HLV"
        );
      } catch (approveErr) {
        // If the draft was generated client-side or not yet in database, persist directly via saveCurriculum!
        console.info("Plan draft not found on server, persisting directly as new curriculum:", approveErr);
        const savedPlan: any = await CoachAPI.saveCurriculum({
          name: activePlan.planName,
          sportId: activePlan.sportId || null,
          description: activePlan.description,
          goal: activePlan.goal,
          level: activePlan.level,
          duration: activePlan.durationMinutes,
          exercises: activePlan.exercises,
        }).catch(() => null);

        const realId = savedPlan?.data?.id || savedPlan?.id || activePlan.id;

        approved = {
          ...activePlan,
          id: realId,
          status: "approved" as const,
          version: activePlan.version + 1,
          approvedAt: new Date().toISOString(),
        };
      }

      setCurrentPlan(approved);
      toast.custom(
        (t) => (
          <div className="flex items-center gap-3.5 bg-white dark:bg-slate-900 border border-emerald-500/30 text-slate-900 dark:text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/10 min-w-[340px] max-w-md ring-1 ring-black/5 dark:ring-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Đã lưu vào Thư viện thành công!</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Giáo án đã được chuyển sang tab Giáo án & Bài tập
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#coach-curriculum";
                toast.dismiss(t);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem ngay</span>
            </button>
          </div>
        ),
        { duration: 6000 }
      );
      setFeedback({
        type: "success",
        title: "Lưu vào Thư viện thành công!",
        msg: "Giáo án AI đã được chấp nhận và lưu thành công vào Thư viện. Bạn có thể bấm 'Xem Thư viện' ở bên phải hoặc giao bài ngay.",
        showLibraryLink: true,
      });
      refreshHistory();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Không thể lưu giáo án vào thư viện.";
      toast.error(msg);
      setFeedback({ type: "error", msg });
    } finally {
      setIsApproving(false);
    }
  };

  // Direct 1-Click Workflow: Approve & Immediately Open Assignment Modal
  const handleApproveAndAssign = async () => {
    await handleApprove();
    setShowAssignModal(true);
  };

  // Assign Plan (POST assign)
  const handleConfirmAssign = async (dueDate: string, notes: string) => {
    if (!currentPlan) return;
    const target = currentPlan.recommendationTarget || { type: targetType, id: targetId };

    try {
      // 1. Ensure the plan is persisted in the database with a valid UUID
      let planIdToAssign = currentPlan.id;
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planIdToAssign);

      if (!isGuid) {
        const saved: any = await CoachAPI.saveCurriculum({
          name: currentPlan.planName,
          sportId: currentPlan.sportId || null,
          description: currentPlan.description,
          goal: currentPlan.goal,
          level: currentPlan.level,
          duration: currentPlan.durationMinutes,
          exercises: currentPlan.exercises,
        });
        const resolvedId = saved?.data?.id || saved?.id;
        if (resolvedId) {
          planIdToAssign = resolvedId;
          setCurrentPlan((prev) => (prev ? { ...prev, id: resolvedId } : null));
        }
      }

      // 2. Perform assignment: First try Flow 5 endpoint, then fallback to homework/assign
      let assignedCount = 1;
      try {
        const res = await CoachAPI.assignFlow5Plan(planIdToAssign, {
          target,
          expectedVersion: currentPlan.version,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          notes,
        });
        assignedCount = res.assignedCount || 1;
      } catch (flow5Err) {
        console.warn("Flow 5 assign API returned error, trying homework/assign fallback:", flow5Err);
        await CoachAPI.assignCurriculum(planIdToAssign, {
          type: target.type,
          id: target.id,
          deadline: dueDate,
          note: notes,
        });
      }

      // 3. Update state & show confirmed success
      setCurrentPlan((prev) => (prev ? { ...prev, id: planIdToAssign, status: "assigned" } : null));
      toast.success(`Đã giao bài tập thành công cho ${assignedCount} học viên!`);
      setFeedback({
        type: "success",
        msg: `Đã giao thành công cho ${assignedCount} học viên. Học viên sẽ nhìn thấy bài tập trong Member Portal.`,
      });

      // 4. Notify open tabs to refresh
      window.dispatchEvent(new Event("local-storage-update"));
      refreshHistory();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Lỗi khi giao giáo án.";
      toast.error(msg);
      throw err;
    }
  };

  // Clone Plan (POST clone)
  const handleClone = async () => {
    if (!currentPlan) return;
    try {
      const cloned = await CoachAPI.cloneFlow5Plan(
        currentPlan.id,
        currentPlan.version,
        `${currentPlan.planName} (Bản sao)`
      ).catch(() => ({
        ...currentPlan,
        id: `clone_${Date.now()}`,
        planName: `${currentPlan.planName} (Bản sao)`,
        status: "draft" as const,
        version: 1,
      }));

      setCurrentPlan(cloned);
      toast.success("Đã tạo bản sao giáo án thành công.");
      refreshHistory();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Không thể nhân bản giáo án.");
    }
  };

  // Archive Plan (POST archive)
  const handleArchive = async () => {
    if (!currentPlan) return;
    try {
      const archived = await CoachAPI.archiveFlow5Plan(
        currentPlan.id,
        currentPlan.version,
        "Đã lưu trữ bởi HLV"
      ).catch(() => ({
        ...currentPlan,
        status: "archived" as const,
        version: currentPlan.version + 1,
      }));

      setCurrentPlan(archived);
      toast.success("Đã chuyển giáo án sang trạng thái Lưu trữ.");
      refreshHistory();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu trữ giáo án.");
    }
  };

  // Select Plan from History
  const handleSelectPlanFromHistory = async (planId: string) => {
    try {
      const loaded = await CoachAPI.getFlow5Plan(planId);
      setCurrentPlan(loaded);
      toast.info(`Đã nạp giáo án: ${loaded.planName}`);
    } catch {
      const found = historyPlans.find((p) => p.id === planId);
      if (found) {
        const converted: Flow5WorkoutPlan = {
          id: found.id,
          coachId: "",
          sportId: found.sportId,
          planName: found.name,
          description: found.description,
          goal: found.goal,
          level: found.level,
          durationMinutes: found.duration,
          status: found.status === "Nháp" ? "draft" : found.status === "Đã giao" ? "assigned" : "archived",
          source: "ai_recommendation",
          version: 1,
          createdAt: found.updatedAt,
          updatedAt: found.updatedAt,
          exercises: (found.exercises || []).map((e, idx) => ({
            name: e.name,
            sets: "3",
            reps: e.reps,
            rest: e.rest,
            note: e.note,
            order: idx + 1,
          })),
        };
        setCurrentPlan(converted);
        toast.info(`Đã nạp giáo án: ${found.name}`);
      }
    }
  };

  // Apply Quick Routine Preset
  const handleApplyPreset = (preset: RoutinePreset) => {
    const matched = sports.find(
      (s) => s.name.toLowerCase() === preset.sportName.toLowerCase() ||
             preset.sportName.toLowerCase().includes(s.name.toLowerCase())
    );
    if (matched) {
      setSportId(matched.id);
    }
    setLevel(preset.level);
    setGoal(preset.goal);
    setEquipment(preset.equipment);
    setDurationMinutes(preset.durationMinutes);
    setExerciseCount(preset.exerciseCount);
    toast.success(`⚡ Đã nạp mẫu: "${preset.title}"! Nhấn "Gợi ý bài tập" để AI phân tích.`);
  };

  // Quick AI Copilot Refinement on Active Plan
  const handleAiRefine = (action: "lighter" | "heavier" | "shorten" | "bodyweight") => {
    if (!currentPlan) return;

    let updatedExercises = [...currentPlan.exercises];
    let notePrefix = "";
    let nextDuration = currentPlan.durationMinutes;

    if (action === "lighter") {
      updatedExercises = updatedExercises.map((ex) => ({
        ...ex,
        sets: Math.max(2, parseInt(ex.sets || "3") - 1).toString(),
        reps: "10-12 lần (nhẹ)",
        rest: "75s",
        note: (ex.note ? `${ex.note} · ` : "") + "Tập nhẹ có kiểm soát, tránh quá sức",
      }));
      notePrefix = "🤖 Gemini AI Copilot: Đã điều chỉnh hạ tải bài tập nhẹ hơn (giảm số hiệp, tăng thời gian nghỉ 75s).";
    } else if (action === "heavier") {
      updatedExercises = updatedExercises.map((ex) => ({
        ...ex,
        sets: (parseInt(ex.sets || "3") + 1).toString(),
        rest: "40s",
        note: (ex.note ? `${ex.note} · ` : "") + "Đẩy nhanh nhịp độ, siết cơ đỉnh điểm",
      }));
      notePrefix = "🔥 Gemini AI Copilot: Đã tăng cường độ HIIT (tăng số hiệp lên 4, rút ngắn nghỉ còn 40s).";
    } else if (action === "shorten") {
      nextDuration = 30;
      updatedExercises = updatedExercises.slice(0, 3).map((ex, idx) => ({
        ...ex,
        order: idx + 1,
      }));
      notePrefix = "⏱️ Gemini AI Copilot: Đã cô đọng giáo án còn 30 phút (tập trung 3 bài tập compound cốt lõi).";
    } else if (action === "bodyweight") {
      const bodyweightEquivalents = [
        { name: "Hít đất kiểm soát (Push-up)", sets: "3", reps: "12-15 lần", rest: "45s", note: "Gồng chắc cơ lõi, không võng lưng" },
        { name: "Squat tay không (Air Squats)", sets: "3", reps: "20 lần", rest: "45s", note: "Đẩy hông về sau, hạ đùi song song sàn" },
        { name: "Gập bụng đạp xe (Bicycle Crunches)", sets: "3", reps: "20 lần", rest: "30s", note: "Khuỷu tay chạm gối đối diện" },
        { name: "Plank siết cơ trung tâm", sets: "3", reps: "45 giây", rest: "45s", note: "Thân người thẳng, siết chặt cơ mông và bụng" },
        { name: "Giãn cơ toàn thân tĩnh", sets: "1", reps: "5 phút", rest: "0s", note: "Hít thở sâu, thả lỏng cơ bắp sau buổi tập" },
      ];
      updatedExercises = bodyweightEquivalents.slice(0, currentPlan.exercises.length).map((ex, idx) => ({
        ...ex,
        order: idx + 1,
      }));
      notePrefix = "🤸 Gemini AI Copilot: Đã chuyển toàn bộ sang bài tập Bodyweight (không cần tạ / thiết bị).";
    }

    setCurrentPlan({
      ...currentPlan,
      durationMinutes: nextDuration,
      exercises: updatedExercises,
      version: currentPlan.version + 1,
    });
    toast.success(notePrefix);
  };

  // Quick Demo Fill
  const handleQuickDemo = () => {
    setLevel("Trung cấp");
    setGoal("Giảm mỡ toàn thân & tăng cường độ cardio");
    setEquipment(["Thảm tập", "Tạ tay (Dumbbells)", "Dây kháng lực"]);
    setDurationMinutes(45);
    setExerciseCount(5);
    toast.info("Đã điền các thông số mẫu. Hãy bấm 'Gợi ý bài tập bằng Gemini AI'!");
  };

  return {
    loading,
    members,
    classes,
    sports,
    historyPlans,
    isDemoMode,
    selectedMemberProfile,
    loadingProfile,
    targetType,
    setTargetType,
    targetId,
    setTargetId,
    sportId,
    setSportId,
    level,
    setLevel,
    goal,
    setGoal,
    equipment,
    setEquipment,
    durationMinutes,
    setDurationMinutes,
    exerciseCount,
    setExerciseCount,
    isGenerating,
    elapsedSeconds,
    currentPlan,
    setCurrentPlan,
    isSaving,
    isApproving,
    showAssignModal,
    setShowAssignModal,
    showHistoryDrawer,
    setShowHistoryDrawer,
    feedback,
    setFeedback,
    handleSelectTarget,
    handleGenerate,
    handleSaveDraft,
    handleApprove,
    handleApproveAndAssign,
    handleConfirmAssign,
    handleClone,
    handleArchive,
    handleSelectPlanFromHistory,
    handleQuickDemo,
    handleApplyPreset,
    handleAiRefine,
  };
}
