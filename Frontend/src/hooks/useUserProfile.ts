import { useCallback, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  avatarUrl: string;
  roleName: string;
  emergencyContact: string;
  specialties?: string;
  certifications?: string;
  experienceYears?: number;
  bio?: string;
  fitnessGoal?: string;
  favoriteSports?: string;
  preferredTime?: string;
  healthNotes?: string;
  workoutGoals?: string;
  memberTier?: string;
}

export const USER_PROFILE_UPDATED_EVENT = 'user-profile-updated';

function getStoredUser(): any | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mapUser(data: any): UserProfile {
  return {
    id: data.id,
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phoneNumber || '',
    dob: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
    gender: data.gender || '',
    avatarUrl: data.avatarUrl || '',
    roleName: data.roleName || '',
    emergencyContact: data.emergencyContact || '',
    specialties: data.specialties || '',
    certifications: data.certifications || '',
    experienceYears: data.experienceYears ?? undefined,
    bio: data.bio || '',
    fitnessGoal: data.fitnessGoal || '',
    favoriteSports: data.favoriteSports || '',
    preferredTime: data.preferredTime || '',
    healthNotes: data.healthNotes || '',
    workoutGoals: data.workoutGoals || '',
    memberTier: data.memberTier || '',
  };
}

function syncStoredUser(profile: UserProfile) {
  const storedUser = getStoredUser();
  if (!storedUser) return;

  localStorage.setItem(
    'user',
    JSON.stringify({
      ...storedUser,
      id: profile.id || storedUser.id,
      fullName: profile.fullName || storedUser.fullName,
      email: profile.email || storedUser.email,
      phoneNumber: profile.phone || storedUser.phoneNumber || storedUser.phone || '',
      phone: profile.phone || storedUser.phone || storedUser.phoneNumber || '',
      dateOfBirth: profile.dob || storedUser.dateOfBirth || '',
      gender: profile.gender || storedUser.gender || '',
      emergencyContact: profile.emergencyContact || storedUser.emergencyContact || '',
      avatarUrl: profile.avatarUrl,
      roleName: profile.roleName || storedUser.roleName,
    }),
  );
}

export function detectPortalRole(portalRoleHint?: 'coach' | 'member'): 'coach' | 'member' {
  if (portalRoleHint) return portalRoleHint;
  const hash = window.location.hash.toLowerCase();
  if (hash.startsWith('#coach-')) return 'coach';
  if (hash.startsWith('#member') || ['#classes', '#schedule', '#pricing'].includes(hash)) return 'member';
  const user = getStoredUser();
  return String(user?.roleName || user?.role || '').toLowerCase() === 'coach' ? 'coach' : 'member';
}

export function useUserProfile(portalRoleHint?: 'coach' | 'member') {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const user = getStoredUser();
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      let token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      let response = await fetch(`/api/users/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/dev-token', { method: 'POST' });
        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json();
          const refreshedToken = refreshed.token;
          if (typeof refreshedToken === 'string' && refreshedToken.length > 0) {
            token = refreshedToken;
            localStorage.setItem('token', token);
            response = await fetch(`/api/users/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      }

      if (!response.ok) throw new Error(`Profile request failed: ${response.status}`);
      const nextProfile = mapUser(await response.json());
      setProfile(nextProfile);
      syncStoredUser(nextProfile);
    } catch (error) {
      console.error('Không thể tải hồ sơ từ database:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();

    const refresh = () => void loadProfile();
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('hashchange', refresh);
    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hashchange', refresh);
    };
  }, [loadProfile, portalRoleHint]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile?.id) throw new Error('Không tìm thấy hồ sơ hiện tại.');

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const response = await fetch(`/api/users/${profile.id}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fullName: updates.fullName,
        phoneNumber: updates.phone,
        email: updates.email,
        avatarUrl: updates.avatarUrl,
        dateOfBirth: updates.dob ? `${updates.dob}T00:00:00Z` : null,
        gender: updates.gender,
        emergencyContact: updates.emergencyContact,
        specialties: updates.specialties,
        certifications: updates.certifications,
        experienceYears: updates.experienceYears,
        bio: updates.bio,
      }),
    });

    if (!response.ok) throw new Error('Cập nhật hồ sơ thất bại.');
    await loadProfile();
    window.dispatchEvent(new Event(USER_PROFILE_UPDATED_EVENT));
  }, [profile?.id, loadProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!profile?.id) throw new Error('Không tìm thấy hồ sơ hiện tại.');

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/users/${profile.id}/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.url !== 'string') {
      throw new Error(result.message || 'Tải ảnh đại diện thất bại.');
    }

    const normalizedUrl = result.url.startsWith("/")
      ? `${window.location.origin}${result.url}`
      : result.url;
    const storedUser = getStoredUser();
    if (storedUser) {
      localStorage.setItem('user', JSON.stringify({ ...storedUser, avatarUrl: normalizedUrl }));
    }
    await loadProfile();
    window.dispatchEvent(new Event(USER_PROFILE_UPDATED_EVENT));
    return normalizedUrl;
  }, [profile?.id, loadProfile]);

  return { profile, loading, updateProfile, uploadAvatar, role: detectPortalRole(portalRoleHint) };
}
