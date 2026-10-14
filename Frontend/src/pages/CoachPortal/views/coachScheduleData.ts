import type { SessionStatus } from "../services/api";
import { getGroupItems } from "./coachScheduleGroups";
import { getPtItems } from "./coachSchedulePt";
import { getOpenSlotItems } from "./coachScheduleOpenSlots";

export interface UnifiedScheduleItem {
  id: string;
  type: "group" | "pt" | "open_pt";
  classId?: string;
  className: string;
  sport: string;
  level: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  coachName: string;
  capacity?: number;
  registeredCount: number;
  status: SessionStatus;
  memberName?: string;
  memberPhone?: string;
  goal?: string;
  note?: string;
}

export function buildUnifiedSchedule(weekDates: string[], openSlots: UnifiedScheduleItem[]) {
  return [
    ...getGroupItems(weekDates),
    ...getPtItems(weekDates),
    ...getOpenSlotItems(weekDates),
    ...openSlots,
  ];
}

