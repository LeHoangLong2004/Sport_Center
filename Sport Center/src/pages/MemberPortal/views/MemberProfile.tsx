import React from 'react';
import { MemberPage } from '../shared';
import MemberShell from '../components/MemberShell';
import { ProfileSettings } from '../../../components/ProfileSettings';

export function MemberProfile({ onNavigate }: { onNavigate: (page: MemberPage) => void }) {
  const membershipInfo = (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full mt-2">
      <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Thông tin gói tập</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Gói hiện tại</span>
          <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">Premium 12 tháng</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày tham gia</span>
          <span className="text-sm font-bold text-slate-800">01/10/2024</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày hết hạn</span>
          <span className="text-sm font-bold text-slate-800">30/09/2025</span>
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
        <ProfileSettings 
          roleLabel="Hội viên Premium" 
          initialData={{ 
            fullName: "Nguyễn Lan Anh", 
            phone: "0912 345 678", 
            email: "lananh@sportscenter.vn", 
            gender: "female", 
            dob: "1995-03-15",
            avatarUrl: "/assets/member-dashboard/af3ea.svg"
          }}
          extraInfo={membershipInfo}
        />
      </div>
    </MemberShell>
  );
}
