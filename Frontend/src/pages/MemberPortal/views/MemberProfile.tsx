import React from 'react';
import { MemberPage } from '../shared';
import MemberShell from '../components/MemberShell';
import { ProfileSettings } from '../../../components/ProfileSettings';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { PackageAPI, getMembershipStatus, MembershipStatus, PackageOrder } from '../../../services/packageApi';

export function MemberProfile({ onNavigate }: { onNavigate: (page: MemberPage) => void }) {
  const { profile, loading } = useUserProfile();
  const [sub, setSub] = React.useState<any>(null);
  const [error, setError] = React.useState<string>("");
  const [membership, setMembership] = React.useState<MembershipStatus | null>(null);
  const [pendingMembership, setPendingMembership] = React.useState<PackageOrder | null>(null);
  const [membershipError, setMembershipError] = React.useState("");
  const [membershipLoading, setMembershipLoading] = React.useState(true);

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
    let mounted = true;
    const loadMembership = async () => {
      setMembershipLoading(true);
      try {
        const [catalog, orders] = await Promise.all([
          PackageAPI.getPackages(),
          PackageAPI.getMyOrders(),
        ]);
        if (!mounted) return;
        setMembership(getMembershipStatus(orders, catalog));
        setPendingMembership(
          orders.find(
            order =>
              order.status === "pending" &&
              order.packageSnapshot.category === "membership",
          ) || null,
        );
        setMembershipError("");
      } catch (membershipLoadError) {
        if (mounted) {
          setMembershipError(
            membershipLoadError instanceof Error
              ? membershipLoadError.message
              : "Không thể tải thông tin hạng thành viên.",
          );
        }
      } finally {
        if (mounted) setMembershipLoading(false);
      }
    };

    void loadMembership();
    import('../services/api').then(({ MemberAPI }) => {
      MemberAPI.getMySubscriptions().then(data => {
        if (data && data.length > 0) setSub(data[0]);
      }).catch(console.error);
    });
    return () => { mounted = false; };
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
          <span className="text-sm font-bold text-slate-800">{sub?.startDate ? new Date(sub.startDate).toLocaleDateString('vi-VN') : '--'}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">Ngày hết hạn</span>
          <span className="text-sm font-bold text-slate-800">{sub?.endDate ? new Date(sub.endDate).toLocaleDateString('vi-VN') : '--'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-500">Trạng thái</span>
          <span className="text-sm font-bold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${(sub && new Date(sub.endDate) > new Date()) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span className={(sub && new Date(sub.endDate) > new Date()) ? 'text-emerald-600' : 'text-slate-500'}>
              {(sub && new Date(sub.endDate) > new Date()) ? 'Đang hoạt động' : 'Chưa có gói / Đã hết hạn'}
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
            {membershipLoading
              ? 'Đang tải...'
              : membership?.name || 'Chưa có dữ liệu'}
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
            <span className={`w-1.5 h-1.5 rounded-full ${membershipError ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            <span className={membershipError ? 'text-red-600' : 'text-emerald-600'}>
              {membershipError
                ? 'Không thể kiểm tra'
                : membershipLoading
                  ? 'Đang kiểm tra'
                  : membership?.tier === 'basic'
                    ? 'Cơ bản · hoạt động'
                    : 'Đang hoạt động'}
            </span>
          </span>
        </div>
      </div>
      {membershipError && (
        <p role="alert" className="mt-3 text-sm text-red-600">{membershipError}</p>
      )}
      {pendingMembership && !membershipError && (
        <p className="mt-3 text-sm text-amber-700">
          Gói {pendingMembership.packageSnapshot.name} đang chờ trung tâm xác nhận thanh toán.
          Hạng thẻ sẽ cập nhật sau khi đơn được xác nhận.
        </p>
      )}
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
          <div className="flex flex-col gap-4">
            {error && (
              <div className="max-w-6xl mx-auto w-full p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                {error}
              </div>
            )}
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
