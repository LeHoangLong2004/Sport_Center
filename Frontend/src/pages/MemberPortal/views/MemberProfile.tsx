import React from 'react';
import { MemberPage } from '../shared';
import MemberShell from '../components/MemberShell';
import { ProfileSettings } from '../../../components/ProfileSettings';
import { useUserProfile } from '../../../hooks/useUserProfile';

export function MemberProfile({ onNavigate }: { onNavigate: (page: MemberPage) => void }) {
  const { profile, loading } = useUserProfile();
  const [sub, setSub] = React.useState<any>(null);
  const [memSub, setMemSub] = React.useState<any>(null);
  const [error, setError] = React.useState<string>("");

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

  React.useEffect(() => {
    import('../services/api').then(({ MemberAPI }) => {
      MemberAPI.getMySubscriptions().then(data => {
        if (data && data.length > 0) {
          setSub(data.find((s: any) => s.packageType === 'sport') || null);
          setMemSub(data.find((s: any) => s.packageType === 'membership') || data[0]);
        }
      }).catch(console.error);
    });
  }, []);

  const membershipInfo = (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full mt-2">
      <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Thông tin gói tập</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Gói hiện tại</span>
          <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">{sub?.packageName || 'Chưa đăng ký'}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày tham gia</span>
          <span className="text-sm font-bold text-slate-800">{sub?.startDate ? sub.startDate.split('T')[0].split('-').reverse().join('/') : '--'}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày hết hạn</span>
          <span className="text-sm font-bold text-slate-800">{sub?.endDate ? sub.endDate.split('T')[0].split('-').reverse().join('/') : '--'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-500">Trạng thái</span>
          <span className="text-sm font-bold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${(sub && (sub.paymentStatus === 1 || sub.paymentStatus === 'Completed') && new Date(sub.endDate) > new Date()) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span className={(sub && (sub.paymentStatus === 1 || sub.paymentStatus === 'Completed') && new Date(sub.endDate) > new Date()) ? 'text-emerald-600' : 'text-slate-500'}>
              {(sub && (sub.paymentStatus === 1 || sub.paymentStatus === 'Completed') && new Date(sub.endDate) > new Date()) ? 'Đang hoạt động' : 'Chưa có gói / Đã hết hạn'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  const memberTierInfo = (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full mt-2">
      <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Thẻ thành viên</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Hạng thẻ</span>
          <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
            {memSub?.packageName || profile?.roleName || 'Member'}
          </span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Mã thành viên</span>
          <span className="text-sm font-bold text-slate-800 uppercase">
            MB-{profile?.id?.substring(0, 6) || 'XXXXXX'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-500">Trạng thái thẻ</span>
          <span className="text-sm font-bold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${memSub ? ((memSub.paymentStatus === 1 || memSub.paymentStatus === 'Completed') && new Date(memSub.endDate) > new Date() ? 'bg-emerald-500' : 'bg-slate-400') : 'bg-emerald-500'}`}></span>
            <span className={memSub ? ((memSub.paymentStatus === 1 || memSub.paymentStatus === 'Completed') && new Date(memSub.endDate) > new Date() ? 'text-emerald-600' : 'text-slate-500') : 'text-emerald-600'}>
              {memSub ? ((memSub.paymentStatus === 1 || memSub.paymentStatus === 'Completed') && new Date(memSub.endDate) > new Date() ? 'Hoạt động' : 'Hết hạn') : 'Hoạt động'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

    let tierColor: 'blue' | 'gold' | 'black' | 'teal' = 'blue';
    const activeRole = memSub?.packageName || profile?.roleName || "Hội viên";
    const lowerRole = activeRole.toLowerCase();
    if (lowerRole.includes('vip') || lowerRole.includes('black')) tierColor = 'black';
    else if (lowerRole.includes('premium') || lowerRole.includes('gold')) tierColor = 'gold';
    else if (lowerRole.includes('member')) tierColor = 'teal';

    return (
      <MemberShell page="profile" onNavigate={onNavigate}>
        <div className="w-full h-full overflow-y-auto bg-slate-50/50">
          {loading ? (
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
                roleLabel={activeRole}
                tierColor={tierColor}
              initialData={profile ? {
              fullName: profile.fullName,
              phone: profile.phone,
              email: profile.email,
              gender: profile.gender,
              dob: profile.dob,
              avatarUrl: profile.avatarUrl,
            } : undefined}
            extraInfo={(
              <>
                {memberTierInfo}
                {membershipInfo}
              </>
            )}
            onSave={handleSave}
          />
          </div>
        )}
      </div>
    </MemberShell>
  );
}

