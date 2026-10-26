import type { Flow5WorkoutPlan, Flow5Target } from "../../services/api";

export function cleanEquipmentList(raw: string[]): string[] {
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
}

export function getFallbackExercises(selectedSport: string): any[] {
  const sportLower = selectedSport.toLowerCase();

  if (sportLower.includes("pilates")) {
    return [
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
  }

  if (sportLower.includes("yoga")) {
    return [
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
  }

  if (sportLower.includes("bơi") || sportLower.includes("swimming")) {
    return [
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
  }

  if (sportLower.includes("box") || sportLower.includes("võ")) {
    return [
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
  }

  // Standard Gym / Strength & Conditioning
  return [
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

interface CreateClientDraftParams {
  sportId: string;
  selectedSport: string;
  goal: string;
  level: string;
  durationMinutes: number;
  equipment: string[];
  exerciseCount: number;
  target: Flow5Target;
}

export function createClientDraft({
  sportId,
  selectedSport,
  goal,
  level,
  durationMinutes,
  equipment,
  exerciseCount,
  target,
}: CreateClientDraftParams): Flow5WorkoutPlan {
  const fallbackExercises = getFallbackExercises(selectedSport);

  return {
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
    recommendationTarget: target,
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
}
