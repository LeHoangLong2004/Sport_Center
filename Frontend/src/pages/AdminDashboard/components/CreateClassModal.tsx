import React, { useState } from 'react';

export function CreateClassModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    sportId: '00000000-0000-0000-0000-000000000001', // Should fetch from real API
    facilityId: '00000000-0000-0000-0000-000000000002', // Should fetch from real API
    coachId: '00000000-0000-0000-0000-000000000003', // Should fetch from real API
    className: 'Yoga buổi sáng',
    scheduleDate: '',
    scheduleTime: '',
    durationMinutes: 60,
    capacity: 20
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Combine date and time to ISO string
      const datetime = new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00`).toISOString();
      
      const payload = {
        sportId: formData.sportId,
        facilityId: formData.facilityId,
        coachId: formData.coachId,
        className: formData.className,
        scheduleTime: datetime,
        durationMinutes: Number(formData.durationMinutes),
        capacity: Number(formData.capacity)
      };

      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi tạo lớp học');
      }

      setSuccess("Tạo lớp học thành công!");
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Tạo lớp học mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{success}</div>}
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Tên lớp học</label>
            <input required type="text" name="className" value={formData.className} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="VD: Yoga thư giãn" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Ngày học</label>
              <input required type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Giờ học</label>
              <input required type="time" name="scheduleTime" value={formData.scheduleTime} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Thời lượng (Phút)</label>
              <input required type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Sức chứa (Người)</label>
              <input required type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <hr className="my-2 border-gray-100" />
          <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded">
            Lưu ý: Chức năng đang dùng UUID giả định cho Môn học, Cơ sở và HLV. Cần đảm bảo Database có các UUID này để không bị lỗi Foreign Key.
          </p>

          <div className="flex gap-3 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Xác nhận tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
