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
  specialties?: string;
  certifications?: string;
  experienceYears?: number;
  bio?: string;
}

export function ProfileSettings({ 
  initialData, 
  roleLabel, 
  onSave,
  extraInfo,
  tierColor = 'blue'
}: { 
  initialData?: Partial<ProfileData>; 
  roleLabel: string;
  onSave?: (data: ProfileData) => void;
  extraInfo?: React.ReactNode;
  tierColor?: 'blue' | 'gold' | 'black' | 'teal';
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
  const [showToast, setShowToast] = useState(false);

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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Đã lưu thông tin thành công!
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Avatar & Extra Info */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${
              tierColor === 'gold' ? 'from-amber-400 to-orange-500' :
              tierColor === 'black' ? 'from-slate-800 to-black' :
              tierColor === 'teal' ? 'from-teal-500 to-emerald-600' :
              'from-blue-600 to-indigo-700'
            } dark:from-slate-700 dark:to-slate-900`}></div>
            <div className={`relative z-10 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg ring-4 ${
              tierColor === 'gold' ? 'ring-amber-50' :
              tierColor === 'black' ? 'ring-slate-100' :
              tierColor === 'teal' ? 'ring-teal-50' :
              'ring-blue-50'
            } dark:ring-slate-700/50 bg-white dark:bg-slate-800 mt-10 mb-4 group cursor-pointer`}>
              <UserAvatar src={data.avatarUrl} name={data.fullName || "User"} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity text-5xl" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <input type="file" className="hidden" accept="image/*" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{data.fullName}</h3>
            <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider border ${
              tierColor === 'gold' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              tierColor === 'black' ? 'bg-slate-800 text-slate-100 border-slate-700' :
              tierColor === 'teal' ? 'bg-teal-50 text-teal-700 border-teal-100' :
              'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
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

            {(roleLabel.toLowerCase().includes("huấn luyện viên") || roleLabel.toLowerCase().includes("coach")) && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Hồ sơ năng lực (Dành cho HLV)</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cập nhật chuyên môn, bằng cấp để hiển thị công khai cho học viên.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bộ môn chuyên môn</label>
                    <input 
                      type="text" 
                      name="specialties"
                      placeholder="VD: Gym, Yoga, Pilates..."
                      value={data.specialties || ""} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Năm kinh nghiệm</label>
                    <input 
                      type="number" 
                      name="experienceYears"
                      min="0"
                      value={data.experienceYears || 0} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bằng cấp & Chứng chỉ</label>
                    <input 
                      type="text" 
                      name="certifications"
                      placeholder="VD: NASM CPT, ACE Personal Trainer..."
                      value={data.certifications || ""} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giới thiệu bản thân</label>
                    <textarea 
                      name="bio"
                      rows={3}
                      placeholder="Viết một đoạn ngắn giới thiệu về phương pháp huấn luyện của bạn..."
                      value={data.bio || ""} 
                      onChange={(e: any) => handleChange(e)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 font-medium resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
            
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
    </>
  );
}
