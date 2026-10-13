import type { UnifiedScheduleItem } from "./coachScheduleData";

export function getOpenSlotItems(weekDates: string[]): UnifiedScheduleItem[] {
  const [mDate, tuDate, wDate, thDate, fDate, saDate, suDate] = weekDates;
      const defaultOpenItems: UnifiedScheduleItem[] = [
        {
          id: "open-slot-1",
          type: "open_pt",
          className: "Lịch trống 1–1 (Mở nhận HV)",
          sport: "Gym",
          level: "1-1 PT",
          date: tuDate,
          startTime: "14:00",
          endTime: "15:30",
          room: "Khu PT 1-1",
          coachName: "HLV Enam",
          registeredCount: 0,
          capacity: 1,
          status: "sắp diễn ra",
          note: "Sẵn sàng nhận hội viên tập tăng cơ, giảm mỡ & siết cơ",
  
        },
        {
          id: "open-slot-2",
          type: "open_pt",
          className: "Lịch trống 1–1 (Mở nhận HV)",
          sport: "Boxing",
          level: "1-1 PT",
          date: thDate,
          startTime: "09:00",
          endTime: "10:30",
          room: "Võ Đài",
          coachName: "HLV Enam",
          registeredCount: 0,
          capacity: 1,
          status: "sắp diễn ra",
          note: "Kèm phản xạ, thể lực & kỹ thuật boxing",
        },
        {
          id: "open-slot-3",
          type: "open_pt",
          className: "Lịch trống 1–1 (Mở nhận HV)",
          sport: "Yoga",
          level: "1-1 PT",
          date: saDate,
          startTime: "15:00",
          endTime: "16:30",
          room: "Studio 2",
          coachName: "HLV Enam",
          registeredCount: 0,
          capacity: 1,
          status: "sắp diễn ra",
          note: "Kèm dẻo dai & giãn cơ sâu phục hồi thể lực",
        },
      ];
  
  return defaultOpenItems;
}

