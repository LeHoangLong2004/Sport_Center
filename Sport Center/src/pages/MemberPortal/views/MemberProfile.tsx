import React from 'react';
import { MemberPage } from '../shared';
import MemberShell from '../components/MemberShell';
import { ProfileSettings } from '../../../components/ProfileSettings';
import { useUserProfile } from '../../../hooks/useUserProfile';

export function MemberProfile({ onNavigate }: { onNavigate: (page: MemberPage) => void }) {
  const { profile, loading } = useUserProfile();

  const membershipInfo = (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full mt-2">
      <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Thông tin gói tập</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Gói hiện tại</span>
          <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">--</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày tham gia</span>
          <span className="text-sm font-bold text-slate-800">--</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày hết hạn</span>
          <span className="text-sm font-bold text-slate-800">--</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-500">Trạng thái</span>
          <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đang hoạt động
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <MemberShell page="profile" onNavigate={onNavigate}>
      <div className="w-full h-full overflow-y-auto bg-slate-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Đang tải thông tin...</p>
          </div>
        ) : (
          <ProfileSettings
            roleLabel={profile?.roleName || "Hội viên"}
            initialData={profile ? {
              fullName: profile.fullName,
              phone: profile.phone,
              email: profile.email,
              gender: profile.gender,
              dob: profile.dob,
              avatarUrl: profile.avatarUrl,
            } : undefined}
            extraInfo={membershipInfo}
          />
        )}
      </div>
    </MemberShell>
  );
}

