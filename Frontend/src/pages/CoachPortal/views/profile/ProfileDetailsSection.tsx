import {
  Phone,
  Mail,
  Calendar,
  Shield,
  Award,
  User,
  CheckCircle2,
  Edit3,
} from "lucide-react";

interface Props {
  phone: string;
  email: string;
  dob?: string;
  gender: string;
  displayCerts: string[];
  onOpenEdit: () => void;
}

export default function ProfileDetailsSection({
  phone,
  email,
  dob,
  gender,
  displayCerts,
  onOpenEdit,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Contact Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-orange-500" />
          Thông tin liên hệ
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Số điện thoại</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {phone || "0900 000 000"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Email công việc</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {email || "hoxuananhnam1@gmail.com"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Ngày sinh</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {dob
                  ? new Date(dob).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "15/08/1998"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Giới tính</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {gender || "Nam"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Trạng thái công tác</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Đang giảng dạy chính thức
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Certifications */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            Bằng cấp & Chứng chỉ chuyên môn
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {displayCerts.length} chứng chỉ đã xác thực
            </span>
            <button
              type="button"
              onClick={onOpenEdit}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Chỉnh sửa
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayCerts.map((c, i) => (
            <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c}</p>
                <p className="text-xs text-slate-400">
                  Đã kiểm tra bởi Quản lý Trung tâm SportCenter
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Thông tin bằng cấp và chứng chỉ được đồng bộ với hồ sơ nhân sự của hệ thống. Bạn có thể thêm hoặc cập nhật các chứng chỉ mới trong phần Cập nhật hồ sơ.
          </p>
        </div>
      </div>
    </div>
  );
}
