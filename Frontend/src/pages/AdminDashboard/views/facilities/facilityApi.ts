import { SportItem, FacilityItem } from '../FacilitiesCards';

export function getAuthToken(): string {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
}

/**
 * Upload tệp ảnh lên server qua endpoint /api/upload/image (Cloudinary / Local storage fallback)
 */
export async function uploadImageFileApi(file: File, folder: 'sports' | 'facilities'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const token = getAuthToken();

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.message || 'Tải ảnh thất bại.');
  }

  return data.url as string;
}

/**
 * Đảm bảo URL ảnh được lưu vĩnh viễn trên server nếu là data:image URI
 */
export async function persistImageUrl(imageUrl: string, folder: 'sports' | 'facilities'): Promise<string> {
  if (!imageUrl.startsWith('data:image/')) return imageUrl;

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('file', blob, `uploaded-${Date.now()}.jpg`);
  formData.append('folder', folder);

  const token = getAuthToken();
  const uploadResponse = await fetch('/api/upload/image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const uploadData = await uploadResponse.json().catch(() => null);
  if (!uploadResponse.ok || !uploadData?.url) {
    throw new Error(uploadData?.message || 'Không thể lưu ảnh lên server.');
  }

  return uploadData.url as string;
}

/**
 * Lấy danh sách bộ môn thể thao
 */
export async function fetchSportsApi(): Promise<SportItem[]> {
  const res = await fetch('/api/sports');
  if (!res.ok) throw new Error('Không thể tải danh sách bộ môn.');
  return res.json();
}

/**
 * Lấy danh sách phòng tập / cơ sở vật chất
 */
export async function fetchFacilitiesApi(): Promise<FacilityItem[]> {
  const res = await fetch('/api/facilities');
  if (!res.ok) throw new Error('Không thể tải danh sách phòng tập.');
  return res.json();
}

/**
 * Thêm mới hoặc cập nhật bộ môn thể thao
 */
export async function saveSportApi(name: string, imageUrl: string, editingId?: string | null): Promise<SportItem> {
  const token = getAuthToken();
  if (!token) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

  const isEdit = !!editingId;
  const endpoint = `/api/sports${isEdit ? `/${editingId}` : ''}`;
  const method = isEdit ? 'PUT' : 'POST';
  const savedImageUrl = await persistImageUrl(imageUrl.trim(), 'sports');

  const res = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: name.trim(), imageUrl: savedImageUrl }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Thao tác bộ môn thất bại.');
  }

  return res.json();
}

/**
 * Thêm mới hoặc cập nhật phòng tập
 */
export async function saveFacilityApi(
  name: string,
  imageUrl: string,
  address: string,
  editingId?: string | null
): Promise<FacilityItem> {
  const token = getAuthToken();
  if (!token) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

  const isEdit = !!editingId;
  const endpoint = `/api/facilities${isEdit ? `/${editingId}` : ''}`;
  const method = isEdit ? 'PUT' : 'POST';
  const savedImageUrl = await persistImageUrl(imageUrl.trim(), 'facilities');

  const res = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: name.trim(), imageUrl: savedImageUrl, address: address.trim() }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Thao tác phòng tập thất bại.');
  }

  return res.json();
}

/**
 * Xóa bộ môn thể thao
 */
export async function deleteSportApi(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`/api/sports/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Không thể xóa bộ môn.');
  }
}

/**
 * Xóa phòng tập / cơ sở vật chất
 */
export async function deleteFacilityApi(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`/api/facilities/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Không thể xóa phòng tập.');
  }
}

