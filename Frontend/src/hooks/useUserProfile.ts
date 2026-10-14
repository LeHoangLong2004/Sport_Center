import { useState, useEffect, useCallback } from 'react';

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
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user.id) throw new Error('Không tìm thấy user id.');

      let token = localStorage.getItem('token');
      let response = await fetch(`/api/users/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/dev-token', { method: 'POST' });
        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json();
          if (refreshed.token) {
            token = refreshed.token;
            localStorage.setItem('token', token);
            response = await fetch(`/api/users/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      }

      if (!response.ok) throw new Error(`Không thể tải hồ sơ (HTTP ${response.status}).`);
      setProfile(mapUser(await response.json()));
    } catch (error) {
      console.error('Không thể tải hồ sơ từ database:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile?.id) throw new Error('Không tìm thấy hồ sơ hiện tại.');

    const token = localStorage.getItem('token');
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
    await fetchProfile();
  }, [profile?.id, fetchProfile]);

  return { profile, loading, updateProfile };
}
