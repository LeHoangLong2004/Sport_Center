import { useState } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberPackageItem } from "../types";
import { DEFAULT_MEMBER_PACKAGES } from "../services/memberData";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

const STORE_PACKAGES = [
  {
    id: "pkg-gym-01",
    name: "Gói Gym & Thể Lực 1 Tháng",
    sport: "Gym",
    days: 30,
    price: 1200000,
    benefits: ["Tập luyện không giới hạn khung giờ", "Sử dụng đầy đủ máy tạ và Cardio", "Tủ locker cá nhân và phòng tắm nóng lạnh"],
    popular: false,
  },
  {
    id: "pkg-gym-03",
    name: "Gói Gym & Thể Lực 3 Tháng",
    sport: "Gym",
    days: 90,
    price: 3200000,
    benefits: ["Tiết kiệm 400.000đ so với gói 1 tháng", "Tặng 1 buổi đo InBody & tư vấn thể chất", "Tủ locker cá nhân và phòng tắm nóng lạnh"],
    popular: true,
  },
  {
    id: "pkg-yoga-03",
    name: "Gói Yoga Chuyên Sâu 3 Tháng",
    sport: "Yoga",
    days: 90,
    price: 3500000,
    benefits: ["Tham gia tất cả các lớp Yoga (Vinyasa, Hatha, Dây)", "Thảm tập và dụng cụ hỗ trợ miễn phí", "Hướng dẫn bởi các Master Trainer Yoga"],
    popular: true,
  },
  {
    id: "pkg-box-01",
    name: "Gói Boxing & Kickfit 1 Tháng",
    sport: "Boxing",
    days: 30,
    price: 1500000,
    benefits: ["Tham gia các lớp Boxing, Kickfit cường độ cao", "Trang bị găng tay và băng quấn tiêu chuẩn", "Phát triển sức mạnh và xả stress cực tốt"],
    popular: false,
  },
  {
    id: "pkg-vip-all",
    name: "Gói Full Access Toàn Diện 1 Năm",
    sport: "Tất cả môn",
    days: 365,
    price: 10900000,
    benefits: ["Tập tất cả các bộ môn: Gym, Yoga, Boxing, Bơi, Pilates", "Tặng 3 buổi tập kèm riêng 1-1 với Huấn luyện viên", "Ưu tiên giữ chỗ hàng đầu cho tất cả các lớp"],
    popular: false,
  },
];

export default function MemberPackages({ onNavigate }: Props) {
  const [packages, setPackages] = useState<MemberPackageItem[]>(DEFAULT_MEMBER_PACKAGES);
  const [selectedSport, setSelectedSport] = useState("all");
  const [buyingPackage, setBuyingPackage] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRegisterPackage = (pkg: any) => {
    // Navigate to payment or create order
    setBuyingPackage(null);
    setFeedback(`Đã tạo đơn đăng ký gói "${pkg.name}". Vui lòng kiểm tra mục Thanh toán để xác nhận.`);
    setTimeout(() => {
      setFeedback(null);
      onNavigate("payments");
    }, 1500);
  };

  const filteredStorePackages = STORE_PACKAGES.filter((p) => {
    if (selectedSport === "all") return true;
    return p.sport.toLowerCase().includes(selectedSport.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Gói tập của tôi</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quản lý quyền lợi thẻ hội viên hiện tại và khám phá các gói dịch vụ thể thao mới
        </p>
      </div>

      {/* 1. MY ACTIVE PACKAGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {pkg.sport} • Còn hiệu lực
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Còn {pkg.daysRemaining} ngày
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
              {pkg.name}
            </h3>

            <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Thời hạn kích hoạt:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {pkg.startDate} đến {pkg.endDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Đã tham gia:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {pkg.usedSessions}/{pkg.totalSessions} buổi học
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (pkg.daysRemaining / 90) * 100)}%` }}
              ></div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setBuyingPackage(pkg)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 text-xs font-bold transition-colors"
              >
                Gia hạn gói này
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. STORE PACKAGES */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Khám phá các gói tập đang mở bán
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đăng ký thêm bộ môn yêu thích hoặc mua dài hạn để nhận ưu đãi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none"
            >
              <option value="all">Tất cả bộ môn</option>
              <option value="Gym">Gym</option>
              <option value="Yoga">Yoga</option>
              <option value="Boxing">Boxing</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStorePackages.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                p.popular
                  ? "bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                  : "bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {p.sport}
                  </span>
                  {p.popular && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Phổ biến nhất
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {p.name}
                </h4>

                <div className="mt-3">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {p.price.toLocaleString("vi-VN")} đ
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ {p.days} ngày</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {p.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setBuyingPackage(p)}
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                  p.popular
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
                }`}
              >
                <span>Đăng ký ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL ĐĂNG KÝ GÓI (PORTAL) */}
      {buyingPackage &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xác nhận đăng ký gói
                </h3>
                <button onClick={() => setBuyingPackage(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
                    {buyingPackage.sport}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {buyingPackage.name}
                  </h4>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    {buyingPackage.price.toLocaleString("vi-VN")} VNĐ
                  </div>
                  <span className="text-slate-500 text-[11px]">Thời hạn áp dụng: {buyingPackage.days} ngày</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Chính sách gói:</p>
                  <p>• Gói sẽ được nối tiếp thời hạn nếu bạn đã có gói cùng môn đang hoạt động.</p>
                  <p>• Bạn có thể thanh toán trực tiếp tại quầy lễ tân hoặc chuyển khoản ngân hàng.</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setBuyingPackage(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleRegisterPackage(buyingPackage)}
                  className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 rounded-lg shadow-sm"
                >
                  Tạo đơn thanh toán
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
