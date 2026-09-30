import React, { useState } from 'react';

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
  onSave 
}: { 
  initialData?: Partial<ProfileData>; 
  roleLabel: string;
  onSave?: (data: ProfileData) => void;
}) {
  const [data, setData] = useState<ProfileData>({
    avatarUrl: initialData?.avatarUrl || "https://i.pravatar.cc/150?img=11",
    fullName: initialData?.fullName || "Nguyễn Văn A",
    email: initialData?.email || "user@sportcenter.com",
    phone: initialData?.phone || "0912345678",
    dob: initialData?.dob || "1995-05-15",
    gender: initialData?.gender || "male",
    address: initialData?.address || "123 Đường Lê Lợi, Quận 1, TP.HCM",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(data);
    alert("Đã lưu thông tin thành công!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden my-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative">
        <h2 className="text-2xl font-bold mb-2">Hồ sơ cá nhân</h2>
        <p className="text-blue-100 opacity-90">Quản lý và cập nhật thông tin tài khoản của bạn</p>
        <span className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/30 shadow-sm">
          {roleLabel}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-gray-100 bg-gray-50">
                <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full cursor-pointer shadow-md transition-colors border-2 border-white" title="Thay đổi ảnh đại diện">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 text-lg">{data.fullName}</h3>
              <p className="text-gray-500 text-sm">{data.email}</p>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <input 
                type="text" 
                name="fullName"
                value={data.fullName} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-800"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
              <input 
                type="tel" 
                name="phone"
                value={data.phone} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-800"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                name="email"
                value={data.email} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-800"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
              <input 
                type="date" 
                name="dob"
                value={data.dob} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-800"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Giới tính</label>
              <select 
                name="gender"
                value={data.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-800 bg-white"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
              <input 
                type="text" 
                name="address"
                value={data.address} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-800"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
            Hủy thay đổi
          </button>
          <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Lưu thông tin
          </button>
        </div>
      </form>
    </div>
  );
}
