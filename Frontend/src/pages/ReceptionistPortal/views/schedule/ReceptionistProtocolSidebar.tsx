import React from "react";
import { ShieldCheck, Phone, UserCheck } from "lucide-react";
import type { Coach } from "./types";

interface Props {
  coaches: Coach[];
}

export const ReceptionistProtocolSidebar: React.FC<Props> = ({ coaches }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Modern Checklist Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs text-xs">
        <div className="flex items-center gap-2 mb-3 font-extrabold text-emerald-950">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs">Quy trình đón tiếp lễ tân</span>
        </div>
        <ul className="space-y-2.5 text-[11px] text-slate-700">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5 shadow-xs">
              1
            </span>
            <span>Gọi nhắc khách trước 30p, kiểm tra trang phục tập.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5 shadow-xs">
              2
            </span>
            <span>Phát vòng tay tủ đồ, khăn tập & mời nước tại sảnh.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5 shadow-xs">
              3
            </span>
            <span>Bấm <strong className="text-emerald-800">"Khách đến"</strong> để báo HLV ra đón vào tập.</span>
          </li>
        </ul>
      </div>

      {/* Modern Coaches Roster */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">
              HLV Trực Hôm Nay ({coaches.length})
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Hotline nhanh
          </span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
          {coaches.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {c.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-800 text-[11px] truncate">
                    {c.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {c.specialty || "HLV Thể thao"}
                  </span>
                </div>
              </div>

              {c.phoneNumber && (
                <a
                  href={`tel:${c.phoneNumber}`}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer shrink-0"
                  title={`Gọi HLV: ${c.phoneNumber}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
