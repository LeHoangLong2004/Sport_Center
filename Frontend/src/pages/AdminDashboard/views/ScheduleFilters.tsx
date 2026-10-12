import { iSearch2 } from "../shared";

interface ScheduleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  facilities: string[];
  selectedRooms: string[];
  onRoomChange: (room: string) => void;
}

export function ScheduleFilters({
  searchQuery,
  onSearchChange,
  facilities,
  selectedRooms,
  onRoomChange,
}: ScheduleFiltersProps) {
  return (
    <div className="w-[240px] shrink-0 flex flex-col gap-4">
      <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2.5 rounded-lg">
        <img src={iSearch2} alt="" className="size-4 shrink-0" />
        <input
          placeholder="Tìm lớp, HLV..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="flex-1 text-sm outline-none"
        />
      </div>
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm">
        <p className="font-bold text-[#0f172a] text-sm mb-3">
          Bộ lọc Phòng tập
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex gap-2 items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedRooms.length === 0}
              onChange={() => onRoomChange("Tất cả")}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[#475569] text-sm group-hover:text-[#0f172a]">
              Tất cả
            </span>
          </label>
          {facilities.map((room, index) => (
            <label
              key={index}
              className="flex gap-2 items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedRooms.includes(room)}
                onChange={() => onRoomChange(room)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[#475569] text-sm group-hover:text-[#0f172a]">
                {room}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 drop-shadow-sm">
        <p className="font-bold text-[#0f172a] text-sm mb-3">
          Huấn luyện viên (Workload)
        </p>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 italic">Đang cập nhật...</p>
        </div>
      </div>
    </div>
  );
}
