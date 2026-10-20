import type { MemberScreen } from "../types";
import { ArrowRight, CreditCard } from "lucide-react";

interface MemberDashboardAsideProps {
  activePackages: Array<any>;
  onNavigate: (screen: MemberScreen) => void;
}

export function MemberDashboardAside({ activePackages, onNavigate }: MemberDashboardAsideProps) {
  return {/* RIGHT COLUMN: ACTIVE PACKAGES & SHORTCUT */}
        <div className="lg:col-span-4 space-y-6">
          {/* Gói tập đang dùng */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gói tập đang dùng</h2>
              <button
                onClick={() => onNavigate("packages")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {activePackages.length > 0 ? "Gia hạn" : "Khám phá"}
              </button>
            </div>

            {activePackages.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bạn chưa đăng ký gói tập nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Đăng ký gói tập môn hoặc thẻ hội viên để bắt đầu luyện tập</p>
                <button
                  onClick={() => onNavigate("packages")}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <span>Xem các gói tập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activePackages.map((pkg) => (
                  <div key={pkg.id} className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {pkg.sport}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Còn {pkg.daysRemaining} ngày</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{pkg.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hạn đến: {pkg.endDate}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (pkg.daysRemaining / 90) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick shortcut */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-md">
            <h3 className="font-extrabold text-sm text-slate-950">Bạn muốn tập luyện hôm nay?</h3>
            <p className="text-xs text-slate-900/80 mt-1">Khám phá hơn 10 bộ môn thể thao và đặt lịch lớp yêu thích ngay.</p>
            <button
              onClick={() => onNavigate("booking")}
              className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Đặt lịch lớp ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>;
}

