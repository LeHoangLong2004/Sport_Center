import { useState, useEffect } from 'react';
import { parseScheduleTime } from '../../../../utils/scheduleTimeHelper';

export interface CreateClassFormData {
  sportId: string;
  facilityId: string;
  coachId: string;
  className: string;
  scheduleDate: string;
  scheduleTime: string;
  durationMinutes: number;
  capacity: number;
}

interface UseCreateClassFormProps {
  editData?: any;
  mode?: "manager" | "coach";
  onSuccess?: () => void;
  onClose: () => void;
}

export function useCreateClassForm({ editData, mode = "manager", onSuccess, onClose }: UseCreateClassFormProps) {
  const isCoachMode = mode === "coach";

  const [formData, setFormData] = useState<CreateClassFormData>(() => {
    if (editData) {
      const d = parseScheduleTime(editData.scheduleTime);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return {
        sportId: editData.sportId || '',
        facilityId: editData.facilityId || '',
        coachId: editData.coachId || '',
        className: editData.className || '',
        scheduleDate: `${year}-${month}-${day}`,
        scheduleTime: `${hours}:${minutes}`,
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

  // Lấy thông tin tài khoản Coach đang đăng nhập
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      setCurrentCoachName(user?.fullName || user?.name || user?.email || 'Coach hiện tại');
    } catch {
      setCurrentCoachName('Coach hiện tại');
    }
  }, []);

  // Fetch sports và facilities ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
        const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const sportsEndpoint = isCoachMode ? "/api/coach/my-sports" : "/api/sports";
        const sportsRes = await fetch(sportsEndpoint, { headers: authHeaders });
        if (sportsRes.ok) {
          const sportsData = await sportsRes.json();
          setSports(Array.isArray(sportsData) ? sportsData : []);
        } else if (isCoachMode) {
          const fallbackRes = await fetch("/api/sports");
          if (fallbackRes.ok) setSports(await fallbackRes.json());
        }

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
  }, [isCoachMode]);

  // Fetch danh sách Coaches theo sportId
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

  // Kiểm tra thời gian tối thiểu (Lead time validation)
  const leadTimeValidation = (() => {
    if (!formData.scheduleDate || !formData.scheduleTime) return null;
    const start = new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00+07:00`);
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
      const scheduleDate = formData.scheduleDate;
      const scheduleTime = formData.scheduleTime;

      if (!scheduleDate || !scheduleTime) {
        throw new Error('Vui lòng chọn đầy đủ ngày và giờ học.');
      }

      const startDateTime = new Date(`${scheduleDate}T${scheduleTime}:00+07:00`);
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
        scheduleTime: `${scheduleDate}T${scheduleTime}:00+07:00`,
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
      window.dispatchEvent(new CustomEvent("class-proposal-updated"));
      window.dispatchEvent(new CustomEvent("coach-schedule-updated"));
      try {
        localStorage.setItem("coach-proposal-timestamp", Date.now().toString());
      } catch {}
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

  return {
    isCoachMode,
    formData,
    setFormData,
    handleChange,
    sports,
    facilities,
    coaches,
    currentCoachName,
    loadingData,
    loading,
    error,
    success,
    leadTimeValidation,
    handleSubmit
  };
}

