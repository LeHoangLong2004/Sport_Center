import React, { useState } from 'react';
import { breadcrumbs, Page, avatarByPage } from './shared';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CheckInPage } from './views/CheckInPage';
import { RegisterPage } from './views/RegisterPage';
import { ClassesPage } from './views/ClassesPage';
import { SchedulePage } from './views/SchedulePage';
import { PosPage } from './views/PosPage';
import { LookupPage } from './views/LookupPage';
import { DetailPage } from './views/DetailPage';
import { ProfileSettings } from '../../components/ProfileSettings';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function ReceptionistPortal({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState<Page>("checkin")
  const { profile, loading } = useUserProfile()
  const [error, setError] = useState<string>("");

  const handleSave = async (data: any) => {
    setError("");
    const phoneRegex = /^(0|84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      setError("Lỗi: Số điện thoại không đúng định dạng.");
      return;
    }

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
        }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.fullName = data.fullName;
        localStorage.setItem("user", JSON.stringify(userObj));
      }
      
      alert("Đã cập nhật hồ sơ thành công!");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu.");
    }
  };

  const { bc, title, shift } = breadcrumbs[page]

  return (
    <div className="flex w-full h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans text-slate-900 dark:text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      <Sidebar page={page} onNavigate={setPage} onLogout={onExit} />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar breadcrumb={bc} title={title} shiftLabel={shift} onProfileClick={() => setPage("profile")} />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {page === "checkin" && <CheckInPage />}
          {page === "register" && <RegisterPage />}
          {page === "classes" && <ClassesPage />}
          {page === "schedule" && <SchedulePage />}
          {page === "pos" && <PosPage />}
          {page === "lookup" && <LookupPage onDetail={() => setPage("detail")} />}
          {page === "detail" && <DetailPage onBack={() => setPage("lookup")} />}
          {page === "profile" && (
            loading ? (
              <div className="flex items-center justify-center h-full">
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
                  roleLabel={profile?.roleName || "Lễ tân"}
                  initialData={profile ? {
                    fullName: profile.fullName,
                    email: profile.email,
                    phone: profile.phone,
                    avatarUrl: profile.avatarUrl,
                    dob: profile.dob,
                    gender: profile.gender,
                  } : undefined}
                  onSave={handleSave}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
