import { useState } from "react";
import { ProfileSettings } from "../../../components/ProfileSettings";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { toast } from 'sonner';

export default function CoachSettings() {
  const { profile, loading } = useUserProfile();
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
      const token = localStorage.getItem("token");
      if (!profile?.id || !token) return;

      const res = await fetch(`/api/users/${profile.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phone,
          dateOfBirth: data.dob ? new Date(data.dob).toISOString() : null,
          gender: data.gender,
          avatarUrl: data.avatarUrl,
          specialties: data.specialties,
          certifications: data.certifications,
          experienceYears: data.experienceYears ? parseInt(data.experienceYears) : 0,
          bio: data.bio
        }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      // 3. Cập nhật localStorage để UI đồng bộ lập tức
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.fullName = data.fullName;
        localStorage.setItem("user", JSON.stringify(userObj));
      }
      
      toast.success("Đã cập nhật hồ sơ thành công!");
      setTimeout(() => window.location.reload(), 1500);
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
          />
        </div>
      )}
    </div>
  );
}
