import React, { useState, useEffect } from 'react';
import { UserAvatar } from './UserAvatar';

interface ProfileData {
  avatarUrl: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
}

export function ProfileSettings({ 
  initialData, 
  roleLabel, 
  onSave,
  extraInfo
}: { 
  initialData?: Partial<ProfileData>; 
  roleLabel: string;
  onSave?: (data: ProfileData) => void;
  extraInfo?: React.ReactNode;
}) {
  const [data, setData] = useState<ProfileData>({
    avatarUrl: initialData?.avatarUrl || "",
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    dob: initialData?.dob || "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
  });

  useEffect(() => {
    if (initialData) {
      setData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(data);
    alert("Đã lưu thông tin thành công!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Avatar & Extra Info */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-700 dark:to-slate-900"></div>
            <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg ring-4 ring-blue-50 dark:ring-slate-700/50 bg-white dark:bg-slate-800 mt-10 mb-4 group cursor-pointer">
              <UserAvatar src={data.avatarUrl} name={data.fullName || "User"} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity text-5xl" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <input type="file" className="hidden" accept="image/*" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{data.fullName}</h3>
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider border border-blue-100 dark:border-blue-500/20">
              {roleLabel}
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">{data.email}</p>
          </div>
          
          {extraInfo}
        </div>

        {/* Right Column: Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700/50">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Thông tin cá nhân</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cập nhật thông tin cá nhân và cách liên hệ với bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ và tên</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={data.fullName} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={data.phone} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={data.email} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày sinh</label>
                <input 
                  type="date" 
                  name="dob"
                  value={data.dob} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giới tính</label>
                <div className="relative">
                  <select 
                    name="gender"
                    value={data.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium appearance-none cursor-pointer"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Địa chỉ liên hệ</label>
                <input 
                  type="text" 
                  name="address"
                  value={data.address} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button type="button" className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                Đổi mật khẩu?
              </button>
              <div className="flex gap-3">
                <button type="button" className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
                  Khôi phục
                </button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
