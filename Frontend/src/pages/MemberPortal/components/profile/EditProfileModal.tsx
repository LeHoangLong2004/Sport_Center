import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
} from "lucide-react";
import { DateInput } from "../../../../components/DateInput";

interface EditProfileModalProps {
  profile: any;
  storedUser: any;
  initialFullName: string;
  initialPhone: string;
  initialEmail: string;
  initialDob: string;
  initialGender: string;
  initialPreferredTime: string;
  initialEmergencyContact: string;
  initialFitnessGoal: string;
  initialFavoriteSportsStr: string;
  initialHealthNotes: string;
  initialWorkoutGoalsList: string[];
  isOpen: boolean;
  saving: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  storedUser,
  initialFullName,
  initialPhone,
  initialEmail,
  initialDob,
  initialGender,
  initialPreferredTime,
  initialEmergencyContact,
  initialFitnessGoal,
  initialFavoriteSportsStr,
  initialHealthNotes,
  initialWorkoutGoalsList,
  isOpen,
  saving,
  message,
  onClose,
  onSave,
}) => {
  const [formFullName, setFormFullName] = useState(initialFullName);
  const [formPhone, setFormPhone] = useState(initialPhone);
  const [formEmail, setFormEmail] = useState(initialEmail);
  const [formDob, setFormDob] = useState(initialDob);
  const [formGender, setFormGender] = useState(
    initialGender && initialGender !== "Chưa cập nhật" ? initialGender : ""
  );
  const [formPreferredTime, setFormPreferredTime] = useState(initialPreferredTime);
  const [formEmergencyContact, setFormEmergencyContact] = useState(initialEmergencyContact);
  const [formFitnessGoal, setFormFitnessGoal] = useState(initialFitnessGoal);
  const [formFavoriteSportsStr, setFormFavoriteSportsStr] = useState(initialFavoriteSportsStr);
  const [formHealthNotes, setFormHealthNotes] = useState(initialHealthNotes);
  const [formGoalsList, setFormGoalsList] = useState<string[]>(initialWorkoutGoalsList);
  const [newGoalInput, setNewGoalInput] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setFormFullName(profile?.fullName || initialFullName || storedUser?.fullName || storedUser?.name || "");
      setFormPhone(profile?.phone || initialPhone || storedUser?.phoneNumber || storedUser?.phone || "");
      setFormEmail(profile?.email || initialEmail || storedUser?.email || "");
      setFormDob(profile?.dob ? profile.dob.split("T")[0] : initialDob);
      setFormGender(
        profile?.gender && profile.gender !== "Chưa cập nhật"
          ? profile.gender
          : initialGender && initialGender !== "Chưa cập nhật"
          ? initialGender
          : ""
      );
      setFormPreferredTime(profile?.preferredTime || initialPreferredTime);
      setFormEmergencyContact(profile?.emergencyContact || initialEmergencyContact);
      setFormFitnessGoal(profile?.fitnessGoal || initialFitnessGoal);
      setFormFavoriteSportsStr(profile?.favoriteSports || initialFavoriteSportsStr);
      setFormHealthNotes(profile?.healthNotes || initialHealthNotes);
      const goals = profile?.workoutGoals
        ? profile.workoutGoals.split(",").map((g: string) => g.trim()).filter(Boolean)
        : initialWorkoutGoalsList;
      setFormGoalsList(goals);
      setNewGoalInput("");
    }
  }, [isOpen, profile]);

  const handleAddGoal = () => {
    const trimmed = newGoalInput.trim();
    if (!trimmed || formGoalsList.includes(trimmed)) return;
    setFormGoalsList([...formGoalsList, trimmed]);
    setNewGoalInput("");
  };

  const handleRemoveGoal = (index: number) => {
    setFormGoalsList(formGoalsList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: formFullName,
      phone: formPhone,
      email: formEmail,
      dob: formDob,
      gender: formGender,
      preferredTime: formPreferredTime,
      emergencyContact: formEmergencyContact,
      fitnessGoal: formFitnessGoal,
      favoriteSports: formFavoriteSportsStr,
      healthNotes: formHealthNotes,
      workoutGoals: formGoalsList.join(", "),
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Chỉnh sửa thông tin hồ sơ
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4 text-xs">
            {message && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Họ và tên: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn A..."
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Số điện thoại: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 0912 345 678"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Email:</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Ngày sinh:</label>
                <DateInput
                  value={formDob}
                  onChange={setFormDob}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Giới tính:</label>
                <select
                  value={formGender || ""}
                  onChange={(e) => setFormGender(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Khung giờ ưu tiên:</label>
                <input
                  type="text"
                  placeholder="VD: 17:30 - 19:30"
                  value={formPreferredTime}
                  onChange={(e) => setFormPreferredTime(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Liên hệ khẩn cấp:</label>
              <input
                type="text"
                placeholder="SĐT & Tên người thân"
                value={formEmergencyContact}
                onChange={(e) => setFormEmergencyContact(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Bộ môn yêu thích (ngăn cách bằng dấu phẩy):
              </label>
              <input
                type="text"
                placeholder="Gym thể hình, Bơi lội, Yoga, Boxing, Pilates..."
                value={formFavoriteSportsStr}
                onChange={(e) => setFormFavoriteSportsStr(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Mục tiêu rèn luyện trọng tâm:
              </label>
              <input
                type="text"
                placeholder="VD: Tăng cơ giảm mỡ, cải thiện sức bền tim mạch..."
                value={formFitnessGoal}
                onChange={(e) => setFormFitnessGoal(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Danh sách mục tiêu & ưu tiên cá nhân ({formGoalsList.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm mục tiêu
                </button>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nhập mục tiêu mới rồi bấm 'Thêm mục tiêu'..."
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                {formGoalsList.map((goal, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{goal}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Xóa mục tiêu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Lưu ý sức khỏe & Thể trạng cá nhân:
              </label>
              <textarea
                rows={3}
                placeholder="Ghi chú về tiền sử chấn thương, dị ứng, vấn đề cơ xương khớp hoặc lưu ý đặc biệt khi tập..."
                value={formHealthNotes}
                onChange={(e) => setFormHealthNotes(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
