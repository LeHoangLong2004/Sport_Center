export interface SyncedExercise {
  name: string;
  sets?: number;
  reps: string;
  rest: string;
  note?: string;
  completed?: boolean;
}

export interface SyncedCurriculumAssignee {
  type: "class" | "member";
  id: string;
  name: string;
  assignedDate: string;
  deadline?: string;
  note?: string;
  progressPercent: number; // 0 - 100
  completedCount: number;
  totalCount: number;
  status: "Đang tập luyện" | "Hoàn thành" | "Chưa bắt đầu";
}

export interface SyncedCurriculum {
  id: string;
  name: string;
  title?: string;
  sport: string;
  goal: string;
  level: string;
  duration: number; // in minutes or weeks
  durationWeeks?: number;
  status: "Nháp" | "Đã giao" | "Lưu trữ" | "Hoàn thành";
  updatedAt: string;
  description: string;
  coachId: string;
  coachName: string;
  exercises: SyncedExercise[];
  assignedTo: SyncedCurriculumAssignee[];
}

export interface SyncedHomeworkTask {
  id: string;
  curriculumId: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  completed: boolean;
  memberId: string;
  reps?: string;
  rest?: string;
}

const STORAGE_CURRICULA_KEY = "synced_curricula_store";
const STORAGE_TASKS_KEY = "synced_member_tasks_store";
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

export const INITIAL_CURRICULA: SyncedCurriculum[] = [
  {
    id: "curr-01",
    name: "Giáo án Tăng cơ ngực & Thể lực cốt lõi",
    title: "Giáo án Tăng cơ ngực & Thể lực cốt lõi",
    sport: "Gym",
    goal: "Tập trung dày cơ ngực trên, siết chặt cơ liên sườn và rèn sức bền cơ bắp.",
    level: "Trung cấp",
    duration: 60,
    durationWeeks: 4,
    status: "Đã giao",
    updatedAt: "2026-10-13",
    description: "Giáo án chuyên biệt cho học viên muốn tăng cơ ngực và săn chắc thân trên.",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    exercises: [
      { name: "Khởi động xoay khớp & chạy máy 5 phút", reps: "5 phút", rest: "30s", note: "Làm nóng các khớp vai và cổ tay" },
      { name: "Barbell Bench Press (Đẩy ngực ngang)", reps: "4 hiệp × 10-12 lần", rest: "90s", note: "Khóa bả vai, hạ tạ kiểm soát" },
      { name: "Incline Dumbbell Press (Đẩy tạ đơn ngực dốc lên)", reps: "4 hiệp × 12 lần", rest: "60s", note: "Góc dốc 30 độ" },
      { name: "Dumbbell Fly (Ép ngực với tạ đơn)", reps: "3 hiệp × 15 lần", rest: "45s", note: "Kéo giãn căng cơ ngực" },
      { name: "Plank gồng cơ bụng giữ kháng lực", reps: "3 hiệp × 60 giây", rest: "45s", note: "Giữ thẳng lưng tự nhiên" },
    ],
    assignedTo: [
      {
        type: "member",
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        name: "Hồ Xuân Ánh Nam",
        assignedDate: "2026-10-13",
        deadline: "2026-10-20",
        note: "Tập 3 buổi/tuần, ghi lại số kg tạ đẩy được",
        progressPercent: 60,
        completedCount: 3,
        totalCount: 5,
        status: "Đang tập luyện",
      },
    ],
  },
  {
    id: "curr-02",
    name: "Giáo án Boxing Phản xạ & Sức bền Cardio",
    title: "Giáo án Boxing Phản xạ & Sức bền Cardio",
    sport: "Boxing",
    goal: "Tăng phản xạ né đòn, nhịp thở khi ra đòn tổ hợp 1-2 và thể lực chiến đấu.",
    level: "Cơ bản",
    duration: 50,
    durationWeeks: 6,
    status: "Đã giao",
    updatedAt: "2026-10-12",
    description: "Rèn luyện thể lực tốc độ cao kết hợp cardio đốt mỡ toàn thân.",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    exercises: [
      { name: "Nhảy dây nhịp độ nhanh", reps: "3 hiệp × 3 phút", rest: "45s", note: "Tiếp đất êm bằng mũi chân" },
      { name: "Shadow Boxing đòn 1-2 & Slip", reps: "4 hiệp × 2 phút", rest: "30s", note: "Xoay hông khi ra đòn Cross" },
      { name: "Đấm bao cát tốc độ cao (Heavy Bag Punching)", reps: "4 hiệp × 3 phút", rest: "60s", note: "Siết nắm đấm chắc" },
      { name: "Chống đẩy kim cương (Diamond Push-ups)", reps: "3 hiệp × 12 lần", rest: "45s", note: "Tăng lực tay sau" },
    ],
    assignedTo: [],
  },
];

export const INITIAL_TASKS: SyncedHomeworkTask[] = [
  {
    id: "task-01",
    curriculumId: "curr-01",
    title: "Khởi động xoay khớp & chạy máy 5 phút",
    description: "Làm nóng các khớp cổ tay, khớp vai và cổ chân trước khi vào bài tập chính.",
    assignedBy: "HLV Hồ Xuân Ánh Nam",
    assignedDate: "2026-10-13",
    dueDate: "2026-10-18",
    completed: true,
    memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    reps: "5 phút",
    rest: "30s",
  },
  {
    id: "task-02",
    curriculumId: "curr-01",
    title: "Barbell Bench Press (Đẩy ngực ngang)",
    description: "4 hiệp × 10-12 lần. Mức tạ tăng dần (20kg - 30kg - 35kg). Nghỉ 90s.",
    assignedBy: "HLV Hồ Xuân Ánh Nam",
    assignedDate: "2026-10-13",
    dueDate: "2026-10-18",
    completed: true,
    memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    reps: "4 hiệp × 10-12 lần",
    rest: "90s",
  },
  {
    id: "task-03",
    curriculumId: "curr-01",
    title: "Incline Dumbbell Press (Đẩy tạ đơn ngực dốc lên)",
    description: "4 hiệp × 12 lần. Chú ý khóa khớp bả vai, góc ghế dốc 30 độ.",
    assignedBy: "HLV Hồ Xuân Ánh Nam",
    assignedDate: "2026-10-13",
    dueDate: "2026-10-18",
    completed: true,
    memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    reps: "4 hiệp × 12 lần",
    rest: "60s",
  },
  {
    id: "task-04",
    curriculumId: "curr-01",
    title: "Dumbbell Fly (Ép ngực với tạ đơn)",
    description: "3 hiệp × 15 lần. Mở rộng lồng ngực khi hạ tạ, cảm nhận cơ ngực căng tối đa.",
    assignedBy: "HLV Hồ Xuân Ánh Nam",
    assignedDate: "2026-10-13",
    dueDate: "2026-10-18",
    completed: false,
    memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    reps: "3 hiệp × 15 lần",
    rest: "45s",
  },
  {
    id: "task-05",
    curriculumId: "curr-01",
    title: "Plank gồng cơ bụng giữ kháng lực",
    description: "3 hiệp × 60 giây. Giữ thẳng cột sống, siết chặt cơ mông và cơ bụng.",
    assignedBy: "HLV Hồ Xuân Ánh Nam",
    assignedDate: "2026-10-13",
    dueDate: "2026-10-18",
    completed: false,
    memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    reps: "3 hiệp × 60 giây",
    rest: "45s",
  },
];

class CurriculumSyncService {
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_CURRICULA_KEY || e.key === STORAGE_TASKS_KEY) {
          this.notify();
        }
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try { l(); } catch {}
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("synced_curricula_event"));
    }
  }

  public getCurricula(): SyncedCurriculum[] {
    try {
      const raw = localStorage.getItem(STORAGE_CURRICULA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    this.saveCurricula(INITIAL_CURRICULA);
    return INITIAL_CURRICULA;
  }

  public saveCurricula(curricula: SyncedCurriculum[]): void {
    try {
      localStorage.setItem(STORAGE_CURRICULA_KEY, JSON.stringify(curricula));
      this.notify();
    } catch (err) {
      console.warn("Failed to save curricula:", err);
    }
  }

  public getTasks(memberId?: string): SyncedHomeworkTask[] {
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (memberId) {
            return parsed.filter((t: SyncedHomeworkTask) => !t.memberId || t.memberId === memberId || memberId.includes("bbbb"));
          }
          return parsed;
        }
      }
    } catch {}
    this.saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }

  public saveTasks(tasks: SyncedHomeworkTask[]): void {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
      this.notify();
    } catch (err) {
      console.warn("Failed to save tasks:", err);
    }
  }

  public assignCurriculumToMember(
    curriculumId: string,
    target: { type: "class" | "member"; id: string; name: string },
    options?: { deadline?: string; note?: string }
  ): SyncedCurriculum | null {
    const curricula = this.getCurricula();
    const curr = curricula.find((c) => c.id === curriculumId);
    if (!curr) return null;

    curr.status = "Đã giao";
    const existingAssigneeIndex = curr.assignedTo.findIndex((a) => a.id === target.id);
    const exercisesCount = curr.exercises.length || 4;

    const assignee: SyncedCurriculumAssignee = {
      type: target.type,
      id: target.id,
      name: target.name,
      assignedDate: new Date().toISOString().split("T")[0],
      deadline: options?.deadline || "2026-10-25",
      note: options?.note || "Hoàn thành đầy đủ các bài tập theo giáo án",
      progressPercent: 0,
      completedCount: 0,
      totalCount: exercisesCount,
      status: "Đang tập luyện",
    };

    if (existingAssigneeIndex >= 0) {
      curr.assignedTo[existingAssigneeIndex] = assignee;
    } else {
      curr.assignedTo.push(assignee);
    }

    this.saveCurricula(curricula);

    if (target.type === "member" || target.name.includes("Nam")) {
      const currentTasks = this.getTasks();
      const newTasks: SyncedHomeworkTask[] = curr.exercises.map((ex, idx) => ({
        id: `task-${curr.id}-${idx}-${Date.now()}`,
        curriculumId: curr.id,
        title: ex.name || `Bài tập #${idx + 1}`,
        description: `${ex.reps ? `Số lượng: ${ex.reps}. ` : ""}${ex.rest ? `Nghỉ: ${ex.rest}. ` : ""}${ex.note || ""}`.trim(),
        assignedBy: curr.coachName || "HLV Hồ Xuân Ánh Nam",
        assignedDate: new Date().toISOString().split("T")[0],
        dueDate: options?.deadline || "2026-10-25",
        completed: false,
        memberId: target.id || "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        reps: ex.reps,
        rest: ex.rest,
      }));

      const mergedTasks = [...newTasks, ...currentTasks.filter((t) => t.curriculumId !== curr.id)];
      this.saveTasks(mergedTasks);
    }

    return curr;
  }

  public toggleTaskCompletion(taskId: string): { tasks: SyncedHomeworkTask[]; progressPercent: number } {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex < 0) return { tasks, progressPercent: 0 };

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    this.saveTasks(tasks);

    const currId = tasks[taskIndex].curriculumId;
    const relatedTasks = tasks.filter((t) => t.curriculumId === currId);
    const completedCount = relatedTasks.filter((t) => t.completed).length;
    const totalCount = relatedTasks.length || 1;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const curricula = this.getCurricula();
    const curr = curricula.find((c) => c.id === currId);
    if (curr) {
      curr.assignedTo.forEach((a) => {
        a.completedCount = completedCount;
        a.totalCount = totalCount;
        a.progressPercent = progressPercent;
        a.status = progressPercent === 100 ? "Hoàn thành" : "Đang tập luyện";
      });
      if (progressPercent === 100) {
        curr.status = "Hoàn thành";
      }
      this.saveCurricula(curricula);
    }

    return { tasks, progressPercent };
  }
}

export const curriculumSync = new CurriculumSyncService();
