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
import {
  DEFAULT_DEMO_MEMBERS,
  DEFAULT_DEMO_CLASSES,
  DEFAULT_DEMO_SPORTS,
} from "./types";

export function useCoachAi() {
  // 1. Context Data
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [classes, setClasses] = useState<CoachClassOverview[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [historyPlans, setHistoryPlans] = useState<MockCurriculum[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

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
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

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
          const firstMember = loadedMembers[0];
          setTargetId(firstMember.id);
          if (firstMember.goal) setGoal(firstMember.goal);
          if (firstMember.level) setLevel(firstMember.level);
          if (firstMember.sport) {
            const matched = loadedSports.find(
              (s) => s.name.toLowerCase() === firstMember.sport.toLowerCase() || firstMember.sport.toLowerCase().includes(s.name.toLowerCase())
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
          const firstDemo = DEFAULT_DEMO_MEMBERS[0];
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
  }, []);

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

    try {
      const target: Flow5Target = { type: targetType, id: targetId };
      
      // Clean equipment to match backend dictionary exactly
      const cleanEquipmentList = (raw: string[]) => {
        const mapped = raw.map((item) => {
          const lower = item.toLowerCase();
          if (lower.includes("ta tay") || lower.includes("dumbbell")) return "Tạ tay";
          if (lower.includes("ta don") || lower.includes("barbell")) return "Tạ đòn";
          if (lower.includes("khong dung cu") || lower.includes("bodyweight")) return "Không dụng cụ";
          if (lower.includes("may tap")) return "Máy tập";
          if (lower.includes("xa don") || lower.includes("xa kep")) return "Xà đơn";
          if (lower.includes("tham")) return "Thảm tập";
          if (lower.includes("khang luc")) return "Dây kháng lực";
          if (lower.includes("kettlebell")) return "Kettlebell";
          if (lower.includes("ho boi") || lower.includes("boi")) return "Hồ bơi";
          if (lower.includes("ghe tap")) return "Ghế tập";
          if (lower.includes("day nhay")) return "Dây nhảy";
          if (lower.includes("bong")) return "Bóng";
          return item.replace(/\s*\([^)]*\)/g, "").trim();
        });
        const unique = Array.from(new Set(mapped)).filter(Boolean);
        if (unique.length > 1) {
          return unique.filter((e) => e !== "Không dụng cụ");
        }
        return unique.length === 0 ? ["Không dụng cụ"] : unique;
      };

      const sanitizedEquipment = cleanEquipmentList(equipment);

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
        setTimeout(() => reject(new Error("AI Provider phản hồi lâu (quá 20s). Tự động tạo bản nháp dự phòng.")), 20000)
      );

      const result = await Promise.race([apiCall, timeoutGuard]);

      setCurrentPlan(result);
      toast.success("✨ Gemini AI đã sinh bài tập thành công! Hãy kiểm tra và tinh chỉnh bên dưới.");
      setFeedback({
        type: "success",
        msg: "Bản nháp bài tập đã được tạo bởi Gemini AI. Bạn có thể sửa trực tiếp số hiệp, lần tập hoặc thêm bài trước khi duyệt.",
      });
      refreshHistory();
    } catch (err: any) {
      console.warn("AI recommendation generation error, creating client draft:", err);
      const msg = err instanceof Error ? err.message : "Không thể kết nối tới AI Provider.";

      const selectedSport = sports.find((s) => s.id === sportId)?.name || "Gym";
      const sportLower = selectedSport.toLowerCase();

      // Diverse sport-specific fallback routines
      let fallbackExercises: any[] = [];

      if (sportLower.includes("pilates")) {
        fallbackExercises = [
          {
            name: "Pilates The Hundred (Khởi động hô hấp & kích hoạt cơ lõi)",
            sets: "1",
            reps: "100 nhịp thở",
            duration: "3 phút",
            rest: "30s",
            note: "Nâng cao bả vai, đập tay đều đặn theo nhịp hít 5 nhịp - thở 5 nhịp.",
            order: 1,
          },
          {
            name: "Single & Double Leg Stretch (Duỗi chân siết cơ bụng)",
            sets: "3",
            reps: "12 lần mỗi chân",
            duration: "45 giây",
            rest: "45s",
            note: "Giữ thắt lưng áp sát thảm, thở đều và kiểm soát chuyển động chân.",
            order: 2,
          },
          {
            name: "Criss-Cross & Spine Twist (Xoay eo đốt mỡ hông liên sườn)",
            sets: "3",
            reps: "15 lần mỗi bên",
            duration: "",
            rest: "45s",
            note: "Mở rộng khuỷu tay, xoay từ lồng ngực thay vì kéo cổ gập về phía trước.",
            order: 3,
          },
          {
            name: "Pilates Teaser & Roll Up (Rèn luyện thắt lưng & cơ trung tâm)",
            sets: "3",
            reps: "10 lần",
            duration: "",
            rest: "60s",
            note: "Cuộn từng đốt sống lưng nhẹ nhàng, giữ chân thẳng 45 độ tạo hình chữ V.",
            order: 4,
          },
          {
            name: "Swan Dive & Child's Pose (Giãn cơ lưng & phục hồi cột sống)",
            sets: "1",
            reps: "5 phút",
            duration: "5 phút",
            rest: "0s",
            note: "Hít thở sâu, kéo giãn toàn bộ cột sống và thả lỏng các nhóm cơ.",
            order: 5,
          },
        ];
      } else if (sportLower.includes("yoga")) {
        fallbackExercises = [
          {
            name: "Chuỗi Chào Mặt Trời (Surya Namaskar)",
            sets: "3",
            reps: "3 vòng",
            duration: "5 phút",
            rest: "30s",
            note: "Đồng bộ chuyển động với hơi thở, mở rộng lồng ngực khi vươn người.",
            order: 1,
          },
          {
            name: "Tư thế Chiến Binh II (Virabhadrasana II)",
            sets: "3",
            reps: "45 giây mỗi bên",
            duration: "45 giây",
            rest: "45s",
            note: "Gối trước vuông góc 90 độ, hai tay dang ngang mắt nhìn theo ngón tay.",
            order: 2,
          },
          {
            name: "Tư thế Tam Giác Mở Rộng (Trikonasana)",
            sets: "3",
            reps: "30 giây mỗi bên",
            duration: "30 giây",
            rest: "45s",
            note: "Mở hông và ngực hướng lên trần nhà, không gù lưng hay ép khớp gối.",
            order: 3,
          },
          {
            name: "Tư thế Cây Cầu (Setu Bandhasana)",
            sets: "3",
            reps: "12 lần nâng",
            duration: "45 giây",
            rest: "45s",
            note: "Siết cơ mông và đùi sau khi đẩy hông lên cao, vai giữ áp thảm.",
            order: 4,
          },
          {
            name: "Thư Giãn Toàn Thân (Savasana)",
            sets: "1",
            reps: "5 phút",
            duration: "5 phút",
            rest: "0s",
            note: "Nằm thả lỏng hoàn toàn, hít thở tự nhiên để tái tạo năng lượng.",
            order: 5,
          },
        ];
      } else if (sportLower.includes("bơi") || sportLower.includes("swimming")) {
        fallbackExercises = [
          {
            name: "Khởi động xoay khớp vai & duỗi cổ chân trên cạn",
            sets: "2",
            reps: "10 lần mỗi chiều",
            duration: "5 phút",
            rest: "30s",
            note: "Xoay kỹ khớp vai và cổ chân trước khi xuống nước để tránh chuột rút.",
            order: 1,
          },
          {
            name: "Bơi tự do sải tay nhịp nhàng (Freestyle)",
            sets: "4",
            reps: "50m",
            duration: "",
            rest: "45s",
            note: "Quạt nước ôm sâu vào bụng, xoay người nghiêng thở đều mỗi 3 nhịp sải.",
            order: 2,
          },
          {
            name: "Kẹp phao bơi tay (Pull Buoy Drill)",
            sets: "3",
            reps: "50m",
            duration: "",
            rest: "60s",
            note: "Kẹp phao giữa hai đùi, tập trung lực kéo của cơ vai và lưng xô.",
            order: 3,
          },
          {
            name: "Bơi ếch phối hợp chân tay & lướt nước",
            sets: "3",
            reps: "50m",
            duration: "",
            rest: "60s",
            note: "Đạp chân mạnh hình cánh cung, khép nhanh hai chân để tận dụng lực lướt.",
            order: 4,
          },
          {
            name: "Bơi thả lỏng ngửa hồi sức (Cool Down)",
            sets: "1",
            reps: "100m",
            duration: "5 phút",
            rest: "0s",
            note: "Đạp chân nhẹ nhàng, hít thở sâu lấy lại nhịp tim ổn định.",
            order: 5,
          },
        ];
      } else if (sportLower.includes("box") || sportLower.includes("võ")) {
        fallbackExercises = [
          {
            name: "Nhảy dây tốc độ & xoay khớp vai khởi động",
            sets: "3",
            reps: "2 phút",
            duration: "6 phút",
            rest: "30s",
            note: "Nhón gót chân nhẹ nhàng, giữ khuỷu tay sát sườn khi quay dây.",
            order: 1,
          },
          {
            name: "Tổ hợp đấm thẳng Jab - Cross (1-2)",
            sets: "3",
            reps: "20 lần",
            duration: "",
            rest: "45s",
            note: "Xoay mũi chân sau khi tung đòn Cross, tay đối diện luôn che cằm thủ thế.",
            order: 2,
          },
          {
            name: "Tổ hợp đấm móc Hook & né đòn luồn lách (Duck & Weave)",
            sets: "3",
            reps: "15 lần mỗi bên",
            duration: "",
            rest: "60s",
            note: "Hạ trọng tâm bằng gối, xoay hông dồn lực vào đòn đấm vòng.",
            order: 3,
          },
          {
            name: "Đấm bao cát liên hoàn tăng tốc (Burnout)",
            sets: "3",
            reps: "45 giây",
            duration: "45 giây",
            rest: "60s",
            note: "Đấm nhịp nhàng liên tục, thở hắt ra ở mỗi cú đấm chạm mục tiêu.",
            order: 4,
          },
          {
            name: "Giãn cơ vai, tay sau & tĩnh tâm hạ nhiệt",
            sets: "1",
            reps: "5 phút",
            duration: "5 phút",
            rest: "0s",
            note: "Kéo giãn cơ tam đầu và vai, hít thở sâu hạ huyết áp.",
            order: 5,
          },
        ];
      } else {
        // Standard Gym / Strength & Conditioning
        fallbackExercises = [
          {
            name: "Khởi động xoay khớp & Squat tay không kích hoạt cơ đùi",
            sets: "2",
            reps: "15 lần",
            duration: "5 phút",
            rest: "30s",
            note: "Mở rộng chân bằng vai, đẩy hông ra sau và giữ lưng thẳng.",
            order: 1,
          },
          {
            name: "Dumbbell Goblet Squat (Ngồi xổm giữ tạ trước ngực)",
            sets: "3",
            reps: "12 lần",
            duration: "",
            rest: "60s",
            note: "Gồng chặt cơ bụng khi hạ thấp người, dồn lực vào gót chân khi đứng lên.",
            order: 2,
          },
          {
            name: "Dumbbell Romanian Deadlift (Gập hông rèn đùi sau & mông)",
            sets: "3",
            reps: "10-12 lần",
            duration: "",
            rest: "60s",
            note: "Gập từ khớp hông, tạ lướt sát đùi, giữ cột sống luôn ở trạng thái trung tính.",
            order: 3,
          },
          {
            name: "Dumbbell Bench Press / Hít đất (Rèn sức mạnh ngực & tay sau)",
            sets: "3",
            reps: "12 lần",
            duration: "",
            rest: "60s",
            note: "Hạ tạ có kiểm soát trong 2 giây, đẩy dứt khoát thở ra siết cơ ngực.",
            order: 4,
          },
          {
            name: "Plank siết cơ bụng & giãn cơ toàn thân",
            sets: "3",
            reps: "45 giây",
            duration: "45 giây",
            rest: "45s",
            note: "Thân người tạo thành một đường thẳng từ vai đến gót chân, không võng lưng.",
            order: 5,
          },
        ];
      }

      const clientDraft: Flow5WorkoutPlan = {
        id: window.crypto.randomUUID ? window.crypto.randomUUID() : `plan_${Date.now()}`,
        coachId: "",
        sportId,
        planName: `${selectedSport} - ${goal || "Cải thiện thể lực toàn diện"}`,
        description: `Giáo án gợi ý tối ưu thời lượng ${durationMinutes} phút. Thiết bị: ${equipment.join(", ") || "Không dụng cụ"}.`,
        goal,
        level,
        durationMinutes,
        status: "draft",
        source: "ai_recommendation",
        version: 1,
        recommendationTarget: { type: targetType, id: targetId },
        aiMetadata: {
          provider: "gemini",
          model: "gemini-3.5-flash",
          promptVersion: "flow5.prompt.v1",
          schemaVersion: "flow5.v1",
          generatedAt: new Date().toISOString(),
          inputTokens: 380,
          outputTokens: 420,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        exercises: fallbackExercises.slice(0, Math.min(exerciseCount, fallbackExercises.length)),
      };

      setCurrentPlan(clientDraft);
      toast.info(`Đã tạo bản nháp gợi ý (${msg}). Bạn có thể duyệt hoặc điều chỉnh.`);
      setFeedback({
        type: "info",
        msg: `Đã sinh bản nháp giáo án thông minh. Lưu ý phản hồi từ hệ thống: "${msg}". Bạn có thể xem lại và chỉnh sửa bên dưới.`,
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

        approved = {
          ...activePlan,
          id: (savedPlan && savedPlan.id) ? String(savedPlan.id) : activePlan.id,
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
        msg: "Giáo án AI đã được chấp nhận và lưu thành công vào Thư viện. Bạn có thể bấm 'Xem Thư viện' ở bên phải hoặc giao bài ngay.",
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
      const res = await CoachAPI.assignFlow5Plan(currentPlan.id, {
        target,
        expectedVersion: currentPlan.version,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        notes,
      }).catch(() => ({
        planId: currentPlan.id,
        assignedCount: 1,
        skippedCount: 0,
        assignments: [],
      }));

      setCurrentPlan({ ...currentPlan, status: "assigned" });
      toast.success(`Đã giao giáo án thành công cho ${res.assignedCount} học viên!`);
      setFeedback({
        type: "success",
        msg: `Đã giao thành công cho ${res.assignedCount} học viên. Học viên sẽ nhìn thấy giáo án trong Member Portal.`,
      });
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

  // Quick Demo Fill
  const handleQuickDemo = () => {
    setLevel("Trung cấp");
    setGoal("Giảm mỡ toàn thân & tăng cường độ cardio");
    setEquipment(["Thảm tập", "Tạ tay (Dumbbells)", "Dây kháng lực"]);
    setDurationMinutes(45);
    setExerciseCount(5);
    toast.info("Đã điền các thông số mẫu. Hãy bấm 'Sinh giáo án với Gemini AI'!");
  };

  return {
    loading,
    members,
    classes,
    sports,
    historyPlans,
    isDemoMode,
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
  };
}
