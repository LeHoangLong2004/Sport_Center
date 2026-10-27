import React from "react";
import { DateInput } from "../../../../../components/DateInput";

interface Props {
  formFullName: string;
  setFormFullName: (v: string) => void;
  formPhone: string;
  setFormPhone: (v: string) => void;
  formEmail: string;
  setFormEmail: (v: string) => void;
  formDob: string;
  setFormDob: (v: string) => void;
  formGender: string;
  setFormGender: (v: string) => void;
  formPreferredTime: string;
  setFormPreferredTime: (v: string) => void;
  formEmergencyContact: string;
  setFormEmergencyContact: (v: string) => void;
  formFavoriteSportsStr: string;
  setFormFavoriteSportsStr: (v: string) => void;
  formFitnessGoal: string;
  setFormFitnessGoal: (v: string) => void;
  formHealthNotes: string;
  setFormHealthNotes: (v: string) => void;
}

export function ProfileBasicFields({
  formFullName,
  setFormFullName,
  formPhone,
  setFormPhone,
  formEmail,
  setFormEmail,
  formDob,
  setFormDob,
  formGender,
  setFormGender,
  formPreferredTime,
  setFormPreferredTime,
  formEmergencyContact,
  setFormEmergencyContact,
  formFavoriteSportsStr,
  setFormFavoriteSportsStr,
  formFitnessGoal,
  setFormFitnessGoal,
  formHealthNotes,
  setFormHealthNotes,
}: Props) {
  return (
    <>
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
    </>
  );
}
