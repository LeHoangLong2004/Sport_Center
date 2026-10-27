import React from "react";
import { ShieldCheck, Phone } from "lucide-react";
import type { Coach } from "./types";

interface Props {
  coaches: Coach[];
}

export const ReceptionistProtocolSidebar: React.FC<Props> = ({ coaches }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Compact Checklist */}
      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-xs text-xs">
        <div className="flex items-center gap-2 mb-2 font-bold text-slate-200">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Quy trình đón tiếp lễ tân</span>
        </div>
        <ul className="space-y-1.5 text-[11px] text-slate-300">
          <li className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
              1
            </span>
            <span>Gọi nhắc khách trước 30p, kiểm tra trang phục tập.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
              2
            </span>
            <span>Phát vòng tay tủ đồ, khăn tập & mời nước tại sảnh.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
              3
            </span>
            <span>Bấm "Khách đến" để báo HLV ra đón vào tập.</span>
          </li>
        </ul>
      </div>

      {/* Compact Coaches Roster */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900">
            HLV Trực Hôm Nay ({coaches.length})
          </span>
          <span className="text-[10px] text-slate-400">Hotline nhanh</span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
          {coaches.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 transition text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {c.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-800 text-[11px] truncate">
                    {c.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {c.specialty || "HLV Cá nhân"}
                  </span>
                </div>
              </div>

              {c.phoneNumber && (
                <a
                  href={`tel:${c.phoneNumber}`}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer shrink-0"
                  title={`Gọi HLV: ${c.phoneNumber}`}
                >
                  <Phone className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
