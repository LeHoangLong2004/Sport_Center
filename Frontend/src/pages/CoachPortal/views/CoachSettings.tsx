import { useState } from "react";
import { ProfileSettings } from "../../../components/ProfileSettings";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { toast } from 'sonner';

export default function CoachSettings() {
  const { profile, loading, updateProfile, uploadAvatar } = useUserProfile();
  const [error, setError] = useState<string>("");

  const handleSave = async (data: any) => {
    setError("");
    
    // 1. Ràng buộc (Validation) riêng cho Coach
    // - Tuổi phải từ 18 trở lên
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setError("Lỗi: Huấn luyện viên phải từ 18 tuổi trở lên.");
        return;
      }
    }

    // - Số điện thoại hợp lệ (10 số, bắt đầu bằng 0 hoặc 84)
    const phoneRegex = /^(0|84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      setError("Lỗi: Số điện thoại không đúng định dạng.");
      return;
    }

    // 2. Gửi API lưu dữ liệu (Thời gian thực)
    try {
      await updateProfile({
        fullName: data.fullName,
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
        avatarUrl: data.avatarUrl,
        specialties: data.specialties,
        certifications: data.certifications,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears) : 0,
        bio: data.bio
      });

      toast.success("Đã cập nhật hồ sơ thành công!");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu.");
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400">Đang tải thông tin...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {error && (
            <div className="max-w-6xl mx-auto w-full p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          <ProfileSettings 
            roleLabel={profile?.roleName || "Huấn luyện viên"}
            initialData={profile ? {
              fullName: profile.fullName,
              phone: profile.phone,
              email: profile.email,
              gender: profile.gender,
              dob: profile.dob,
              avatarUrl: profile.avatarUrl,
              specialties: profile.specialties,
              certifications: profile.certifications,
              experienceYears: profile.experienceYears,
              bio: profile.bio
            } : undefined}
            onSave={handleSave}
            onAvatarUpload={uploadAvatar}
          />
        </div>
      )}
    </div>
  );
}
