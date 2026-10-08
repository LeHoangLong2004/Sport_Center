import React, { useState, useEffect } from 'react';

export function CreateClassModal({ onClose, editData }: { onClose: () => void, editData?: any }) {
  const [formData, setFormData] = useState(() => {
    if (editData) {
      const d = new Date(editData.scheduleTime);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      const [datePart, timePart] = localISOTime.split('T');
      return {
        sportId: editData.sportId || '',
        facilityId: editData.facilityId || '',
        coachId: editData.coachId || '',
        className: editData.className || '',
        scheduleDate: datePart,
        scheduleTime: timePart,
        durationMinutes: editData.durationMinutes || 60,
        capacity: editData.capacity || 20
      };
    }
    return {
      sportId: '',
      facilityId: '',
      coachId: '',
      className: '',
      scheduleDate: '',
      scheduleTime: '',
      durationMinutes: 60,
      capacity: 20
    };
  });

  const [coaches, setCoaches] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {

        // Fetch sports
        const sportsRes = await fetch("/api/sports");
        if (sportsRes.ok) {
          const sportsData = await sportsRes.json();
          setSports(sportsData);
        }

        // Fetch facilities
        const facilitiesRes = await fetch("/api/facilities");
        if (facilitiesRes.ok) {
          const facilitiesData = await facilitiesRes.json();
          setFacilities(facilitiesData);
        }

      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Fetch coaches whenever sportId changes
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        let url = "/api/coaches";
        if (formData.sportId) {
          url += `?sportId=${formData.sportId}`;
        }
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCoaches(data);
        }
      } catch (err) {
        console.error("Failed to fetch coaches", err);
      }
    };
    fetchCoaches();
  }, [formData.sportId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Nếu đổi môn học, tự động reset HLV đã chọn
      if (name === 'sportId') {
        next.coachId = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00`);
      
      const payload = {
        sportId: formData.sportId,
        facilityId: formData.facilityId,
        coachId: formData.coachId,
        className: formData.className,
        scheduleTime: startDateTime.toISOString(),
        durationMinutes: Number(formData.durationMinutes),
        capacity: Number(formData.capacity)
      };

      const url = editData ? `/api/classes/${editData.id}` : "/api/classes";
      const method = editData ? "PUT" : "POST";

      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else if (contentType && contentType.includes("application/problem+json")) {
        const problem = await res.json();
        data = { message: problem.title || JSON.stringify(problem.errors) };
      } else {
        const text = await res.text();
        data = { message: text || `HTTP Error ${res.status}` };
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Không có quyền thực hiện (Lỗi 401/403)");
        }
        throw new Error(data.message || `Lỗi khi ${editData ? 'cập nhật' : 'tạo'} lớp học`);
      }

      setSuccess(data.message || (editData ? "Cập nhật thành công!" : "Tạo lớp học thành công!"));
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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{editData ? "Cập nhật thông tin lớp học" : "Tạo lớp học mới"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Môn học</label>
                <select required name="sportId" value={formData.sportId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white">
                  <option value="">-- Chọn môn học --</option>
                  {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Phòng tập</label>
                <select required name="facilityId" value={formData.facilityId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white">
                  <option value="">-- Chọn phòng tập --</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Huấn luyện viên</label>
              <select required name="coachId" value={formData.coachId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white">
                <option value="">-- Chọn HLV --</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.fullName || c.email}</option>)}
              </select>
              {loadingData && <p className="text-xs text-amber-600 mt-1">Đang tải dữ liệu...</p>}
              {!loadingData && coaches.length === 0 && <p className="text-xs text-red-600 mt-1">Chưa có HLV nào trong hệ thống.</p>}
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

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Đang xử lý...' : (editData ? 'Lưu thay đổi' : 'Xác nhận tạo')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
