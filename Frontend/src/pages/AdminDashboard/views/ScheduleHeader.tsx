type ScheduleTab = "calendar" | "bookings";

interface ScheduleHeaderProps {
  activeTab: ScheduleTab;
  onTabChange: (tab: ScheduleTab) => void;
  onCreate: () => void;
}

export function ScheduleHeader({
  activeTab,
  onTabChange,
  onCreate,
}: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
      <div>
        <p className="font-bold text-[#0f172a] text-[28px]">
          Lịch trình & Lớp học
        </p>
        <p className="text-[#64748b] text-sm mt-1">
          Sắp xếp thời khóa biểu và phân công HLV cho các lớp Group-X.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-[#f1f5f9] p-1 rounded-lg flex items-center shrink-0">
          <button
            onClick={() => onTabChange("calendar")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === "calendar" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
          >
            Lịch trình
          </button>
          <button
            onClick={() => onTabChange("bookings")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === "bookings" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
          >
            Danh sách đặt chỗ
          </button>
        </div>
        {activeTab === "calendar" && (
          <button
            onClick={onCreate}
            className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="font-semibold text-white text-sm">
              + Tạo lớp mới
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
