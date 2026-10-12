import { useState, useEffect } from 'react';

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

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id || '',
          fullName: user.fullName || user.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          phone: '',
          dob: '',
          gender: '',
          avatarUrl: '',
          roleName: user.roleName || user.role || '',
          emergencyContact: '',
          specialties: '',
          certifications: '',
          experienceYears: 0,
          bio: '',
        }
      } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!userStr || !token) return;

        let res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          // Token expired, auto refresh token silently
          try {
            const refreshRes = await fetch('/api/auth/dev-token', { method: 'POST' });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.token) {
                localStorage.setItem('token', refreshData.token);
                res = await fetch(`/api/users/${user.id}`, {
                  headers: { Authorization: `Bearer ${refreshData.token}` },
                });
              }
            }
          } catch (e) {
            console.warn('Auto refresh token failed:', e);
          }
        }

        if (res.ok) {
          const data = await res.json();
          setProfile({
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
            experienceYears: data.experienceYears || 0,
            bio: data.bio || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading };
}
