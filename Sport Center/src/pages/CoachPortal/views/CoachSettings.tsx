import { ProfileSettings } from "../../../components/ProfileSettings";
import { useUserProfile } from "../../../hooks/useUserProfile";

export default function CoachSettings() {
  const { profile, loading } = useUserProfile();

  return (
    <div className="p-6 h-full overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-400">Đang tải thông tin...</p>
        </div>
      ) : (
        <ProfileSettings 
          roleLabel={profile?.roleName || "Huấn luyện viên"}
          initialData={profile ? {
            fullName: profile.fullName,
            phone: profile.phone,
            email: profile.email,
            gender: profile.gender,
            dob: profile.dob,
            avatarUrl: profile.avatarUrl,
          } : undefined}
        />
      )}
    </div>
  );
}
