import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import CertsEditSection from "./CertsEditSection";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    fullName: string;
    phone: string;
    email: string;
    dob: string;
    gender: string;
    avatarUrl: string;
    experienceYears: number;
    specialtiesStr: string;
    certsList: string[];
    bio: string;
  };
  onSave: (data: {
    fullName: string;
    phone: string;
    email: string;
    dob: string;
    gender: string;
    avatarUrl: string;
    experienceYears: number;
    specialties: string;
    certifications: string;
    bio: string;
  }) => Promise<void>;
  saving: boolean;
  message: { type: "success" | "error"; text: string } | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  saving,
  message,
}: Props) {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [phone, setPhone] = useState(initialData.phone);
  const [email, setEmail] = useState(initialData.email);
  const [dob, setDob] = useState(initialData.dob);
  const [gender, setGender] = useState(initialData.gender);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);
  const [experienceYears, setExperienceYears] = useState(initialData.experienceYears);
  const [specialtiesStr, setSpecialtiesStr] = useState(initialData.specialtiesStr);
  const [certsList, setCertsList] = useState<string[]>(initialData.certsList);
  const [newCertInput, setNewCertInput] = useState("");
  const [bio, setBio] = useState(initialData.bio);

  useEffect(() => {
    if (isOpen) {
      setFullName(initialData.fullName);
      setPhone(initialData.phone);
      setEmail(initialData.email);
      setDob(initialData.dob);
      setGender(initialData.gender);
      setAvatarUrl(initialData.avatarUrl);
      setExperienceYears(initialData.experienceYears);
      setSpecialtiesStr(initialData.specialtiesStr);
      setCertsList(initialData.certsList);
      setBio(initialData.bio);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    setCertsList([...certsList, newCertInput.trim()]);
    setNewCertInput("");
  };

  const handleRemoveCert = (index: number) => {
    setCertsList(certsList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName,
      phone,
      email,
      dob,
      gender,
      avatarUrl,
      experienceYears,
      specialties: specialtiesStr,
      certifications: certsList.join(", "),
      bio,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Chỉnh sửa hồ sơ huấn luyện viên
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            {message && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
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
                placeholder="VD: Enam..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                  placeholder="VD: 0900 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Email:
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Ngày sinh:
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Giới tính:
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Kinh nghiệm (năm):
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Link ảnh đại diện (Avatar URL):
              </label>
              <input
                type="text"
                placeholder="https://... hoặc để trống"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Chuyên môn (ngăn cách bằng dấu phẩy):
              </label>
              <input
                type="text"
                placeholder="Gym Fitness, Yoga, BodyCombat, Boxing..."
                value={specialtiesStr}
                onChange={(e) => setSpecialtiesStr(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <CertsEditSection
              certsList={certsList}
              newCertInput={newCertInput}
              setNewCertInput={setNewCertInput}
              onAddCert={handleAddCert}
              onRemoveCert={handleRemoveCert}
            />

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Tiểu sử & Phương châm huấn luyện:
              </label>
              <textarea
                rows={3}
                placeholder="Ghi chú thêm về phong cách huấn luyện, thành tích cá nhân..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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
}
