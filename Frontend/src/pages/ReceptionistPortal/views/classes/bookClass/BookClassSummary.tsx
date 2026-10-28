import React from "react";

interface Props {
  selectedClass: any;
}

export function BookClassSummary({ selectedClass }: Props) {
  return (
    <>
      {/* Class Summary */}
      <div className="flex gap-3.5 items-center p-3 bg-slate-50/90 rounded-2xl border border-slate-100">
        <img
          src={`/assets/member-booking/${selectedClass.image}`}
          className="size-14 rounded-xl object-cover shadow-2xs shrink-0 border border-slate-200"
          alt=""
        />
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h4 className="font-bold text-slate-800 text-sm leading-snug truncate">
            {selectedClass.title}
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
            {selectedClass.schedule}
          </p>
        </div>
      </div>

      {/* Class Info Pill */}
      <div className="bg-purple-50/80 border border-purple-100/90 p-3 rounded-xl grid grid-cols-3 gap-2 text-xs text-purple-900">
        <div className="truncate">
          <span className="text-purple-500 font-medium block text-[10px] uppercase">HLV</span>
          <strong className="font-semibold text-slate-800 truncate block">{selectedClass.coach}</strong>
        </div>
        <div className="truncate">
          <span className="text-purple-500 font-medium block text-[10px] uppercase">Phòng</span>
          <strong className="font-semibold text-slate-800 truncate block">{selectedClass.room?.replace?.("Phòng: ", "") || selectedClass.room}</strong>
        </div>
        <div className="truncate">
          <span className="text-purple-500 font-medium block text-[10px] uppercase">Chỗ trống</span>
          <strong className="font-semibold text-emerald-600 truncate block">{selectedClass.spacesText}</strong>
        </div>
      </div>
    </>
  );
}
