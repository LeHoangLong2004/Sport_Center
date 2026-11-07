import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DateInput } from '../../../components/DateInput';

export function CreateClassModal({ onClose, onSuccess, editData, mode = "manager" }: { onClose: () => void, onSuccess?: () => void, editData?: any, mode?: "manager" | "coach" }) {
  const modalRootRef = useRef<HTMLDivElement>(null);
  const isCoachMode = mode === "coach";
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
  const [currentCoachName, setCurrentCoachName] = useState('Coach hiện tại');

  // Lock background UI scrolling while modal is open, and restore when closed
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const modalEl = modalRootRef.current;
    const scrollContainers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.manager-page-content, .portal-page-enter, [class*="overflow-y-auto"]'
      )
    ).filter((el) => !modalEl || !modalEl.contains(el));

    const originalContainerStyles = scrollContainers.map((el) => ({
      el,
      overflow: el.style.overflow,
    }));

    scrollContainers.forEach((el) => {
      el.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      originalContainerStyles.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      setCurrentCoachName(user?.fullName || user?.name || user?.email || 'Coach hiện tại');
    } catch {
      setCurrentCoachName('Coach hiện tại');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch sports: Nếu là Coach đề xuất lớp thì chỉ lấy các bộ môn HLV đang phụ trách
        const sportsEndpoint = isCoachMode ? "/api/coach/my-sports" : "/api/sports";
        const sportsRes = await fetch(sportsEndpoint, { headers: authHeaders });
        if (sportsRes.ok) {
          const sportsData = await sportsRes.json();
          setSports(Array.isArray(sportsData) ? sportsData : []);
        } else if (isCoachMode) {
          // Fallback nếu có lỗi
          const fallbackRes = await fetch("/api/sports");
          if (fallbackRes.ok) setSports(await fallbackRes.json());
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

  const leadTimeValidation = (() => {
    if (!formData.scheduleDate || !formData.scheduleTime) return null;
    const start = new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00`);
    if (Number.isNaN(start.getTime())) return null;
    const diffHours = (start.getTime() - Date.now()) / (1000 * 60 * 60);
    if (isCoachMode) {
      if (diffHours < 24) {
        return {
          valid: false,
          message: diffHours <= 0
            ? "Thời gian bắt đầu lớp học phải ở tương lai và cách hiện tại ít nhất 24 giờ."
            : `Thời gian đã chọn chỉ cách hiện tại khoảng ${Math.floor(diffHours)} giờ. Lớp đề xuất phải cách thời điểm hiện tại tối thiểu 24 giờ.`
        };
      }
    } else if (!editData) {
      if (diffHours <= 0) {
        return {
          valid: false,
          message: "Thời gian bắt đầu lớp học phải sau thời điểm hiện tại."
        };
      }
    }
    return { valid: true, message: "" };
  })();

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
      const scheduleDate = formData.scheduleDate;
      const scheduleTime = formData.scheduleTime;

      if (!scheduleDate || !scheduleTime) {
        throw new Error('Vui lòng chọn đầy đủ ngày và giờ học.');
      }

      const startDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      if (Number.isNaN(startDateTime.getTime())) {
        throw new Error('Ngày hoặc giờ học không hợp lệ.');
      }

      const now = new Date();
      if (!editData && startDateTime <= now) {
        throw new Error('Thời gian học phải sau thời điểm hiện tại.');
      }

      if (isCoachMode) {
        const minAllowedTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (startDateTime < minAllowedTime) {
          throw new Error('Thời gian bắt đầu lớp học đề xuất phải cách thời điểm hiện tại ít nhất 24 giờ để Ban quản lý kịp phê duyệt và hội viên đăng ký.');
        }
      }
      
      const payload = {
        sportId: formData.sportId,
        facilityId: formData.facilityId,
        className: formData.className,
        scheduleTime: startDateTime.toISOString(),
        durationMinutes: Number(formData.durationMinutes),
        capacity: Number(formData.capacity)
      };

      const requestPayload = isCoachMode
        ? payload
        : { ...payload, coachId: formData.coachId };

      const url = isCoachMode
        ? "/api/classes/proposals"
        : editData
          ? `/api/classes/${editData.id}`
          : "/api/classes";
      const method = isCoachMode || !editData ? "POST" : "PUT";

      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestPayload)
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

      setSuccess(data.message || (isCoachMode ? "Đề xuất đã được gửi để Manager duyệt!" : editData ? "Cập nhật thành công!" : "Tạo lớp học thành công!"));
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      ref={modalRootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overscroll-contain backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{isCoachMode ? "Đề xuất lớp học mới" : editData ? "Cập nhật thông tin lớp học" : "Tạo lớp học mới"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{success}</div>}

            {isCoachMode && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-900 flex items-start gap-2.5">
                <span className="text-base leading-none shrink-0 mt-0.5">⏱️</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Quy định thời gian đề xuất lớp</p>
                  <p className="text-slate-800 leading-relaxed">
                    Lớp học đề xuất phải bắt đầu sau thời điểm hiện tại <strong>tối thiểu 24 giờ</strong> để Ban quản lý kịp phê duyệt và mở cho Hội viên đăng ký.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Tên lớp học</label>
              <input required type="text" name="className" value={formData.className} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" placeholder="VD: Yoga thư giãn" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Ngày học</label>
                <DateInput required value={formData.scheduleDate} onChange={(value) => setFormData((prev) => ({ ...prev, scheduleDate: value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500" />
                {isCoachMode && (
                  <p className="mt-1 text-[11px] text-slate-500">Tối thiểu từ ngày mai trở đi</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Giờ học</label>
                <input required type="time" name="scheduleTime" value={formData.scheduleTime} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500" />
                {isCoachMode && (
                  <p className="mt-1 text-[11px] text-slate-500">Cách hiện tại ≥ 24h</p>
                )}
              </div>
            </div>

            {leadTimeValidation && !leadTimeValidation.valid && (
              <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800">
                <svg className="h-4 w-4 shrink-0 text-slate-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{leadTimeValidation.message}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Môn học</label>
                <select required name="sportId" value={formData.sportId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 bg-white">
                  <option value="">-- {sports.length === 0 ? (isCoachMode ? "Chưa được phân công môn nào" : "Không có môn") : "Chọn môn học"} --</option>
                  {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {isCoachMode && sports.length === 0 && !loadingData && (
                  <p className="mt-1 text-[11px] text-slate-600 font-medium">Bạn chưa được Quản lý phân công môn nào để mở lớp.</p>
                )}
                {isCoachMode && sports.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500">Chỉ hiển thị các môn bạn được phân công ({sports.length} môn).</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Phòng tập</label>
                <select required name="facilityId" value={formData.facilityId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 bg-white">
                  <option value="">-- Chọn phòng tập --</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Huấn luyện viên</label>
              {isCoachMode ? (
                <>
                  <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {currentCoachName}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Đề xuất sẽ được gắn với tài khoản Coach đang đăng nhập.</p>
                </>
              ) : (
                <>
                  <select required name="coachId" value={formData.coachId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 bg-white">
                    <option value="">-- Chọn HLV --</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.fullName || c.email}</option>)}
                  </select>
                  {loadingData && <p className="text-xs text-slate-600 mt-1">Đang tải dữ liệu...</p>}
                  {!loadingData && coaches.length === 0 && <p className="text-xs text-red-600 mt-1">Chưa có HLV nào trong hệ thống.</p>}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Thời lượng (Phút)</label>
                <input required type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Sức chứa (Người)</label>
                <input required type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500" />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || (leadTimeValidation !== null && !leadTimeValidation.valid)}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              >
                {loading ? 'Đang xử lý...' : (isCoachMode ? 'Gửi đề xuất mở lớp' : editData ? 'Lưu thay đổi' : 'Xác nhận tạo lớp')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
