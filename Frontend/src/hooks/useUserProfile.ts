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

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user.id || '25f50fba-506a-4edf-9db7-43f77f6741a4';
        const overrideStr = localStorage.getItem(`user_profile_${userId}`);
        const override = overrideStr ? JSON.parse(overrideStr) : {};

        return {
          id: userId,
          fullName: override.fullName || user.fullName || user.name || user.email?.split('@')[0] || 'Enam',
          email: override.email || user.email || 'hoxuananhnam1@gmail.com',
          phone: override.phone || user.phoneNumber || user.phone || '0900 000 000',
          dob: override.dob || user.dateOfBirth || user.dob || '1998-08-15',
          gender: override.gender || user.gender || 'Nam',
          avatarUrl: override.avatarUrl || user.avatarUrl || '',
          roleName: user.roleName || user.role || 'Coach',
          emergencyContact: override.emergencyContact || user.emergencyContact || '',
          specialties: override.specialties || user.specialties || 'Gym Fitness, Yoga, BodyCombat',
          certifications: override.certifications || user.certifications || 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM), Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified), Chứng chỉ Dinh dưỡng Thể thao Cơ bản',
          experienceYears: override.experienceYears ?? user.experienceYears ?? 3,
          bio: override.bio || user.bio || 'Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên.',
        };
      } catch (e) {
        console.error('Lỗi đọc localStorage user:', e);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const userId = user.id || '25f50fba-506a-4edf-9db7-43f77f6741a4';
        const token = localStorage.getItem('token');

        // Check local saved override first
        const overrideStr = localStorage.getItem(`user_profile_${userId}`);
        const override = overrideStr ? JSON.parse(overrideStr) : {};

        let res = await fetch(`/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401) {
          try {
            const refreshRes = await fetch('/api/auth/dev-token', { method: 'POST' });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.token) {
                localStorage.setItem('token', refreshData.token);
                res = await fetch(`/api/users/${userId}`, {
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
            id: data.id || userId,
            fullName: override.fullName || data.fullName || user.fullName || 'Enam',
            email: override.email || data.email || user.email || 'hoxuananhnam1@gmail.com',
            phone: override.phone || data.phoneNumber || user.phone || '0900 000 000',
            dob: override.dob || (data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '1998-08-15'),
            gender: override.gender || data.gender || 'Nam',
            avatarUrl: override.avatarUrl || data.avatarUrl || '',
            roleName: data.roleName || user.roleName || user.role || 'Coach',
            emergencyContact: override.emergencyContact || data.emergencyContact || '',
            specialties: override.specialties || data.specialties || user.specialties || 'Gym Fitness, Yoga, BodyCombat',
            certifications: override.certifications || data.certifications || user.certifications || 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM), Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified), Chứng chỉ Dinh dưỡng Thể thao Cơ bản',
            experienceYears: override.experienceYears ?? data.experienceYears ?? user.experienceYears ?? 3,
            bio: override.bio || data.bio || user.bio || 'Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên.',
          });
        }
      } catch (err) {
        console.warn('Failed to fetch user profile, using local state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const merged: UserProfile = {
        ...(prev || {
          id: '25f50fba-506a-4edf-9db7-43f77f6741a4',
          fullName: 'Enam',
          email: 'hoxuananhnam1@gmail.com',
          phone: '0900 000 000',
          dob: '1998-08-15',
          gender: 'Nam',
          avatarUrl: '',
          roleName: 'Coach',
          emergencyContact: '',
          specialties: 'Gym Fitness, Yoga, BodyCombat',
          certifications: 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM), Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified), Chứng chỉ Dinh dưỡng Thể thao Cơ bản',
          experienceYears: 3,
          bio: 'Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên.',
        }),
        ...updates,
      };

      const userId = merged.id || '25f50fba-506a-4edf-9db7-43f77f6741a4';

      // Persist in localStorage override
      localStorage.setItem(`user_profile_${userId}`, JSON.stringify(merged));

      // Also sync user in localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userObj.fullName = merged.fullName;
          userObj.phone = merged.phone;
          userObj.phoneNumber = merged.phone;
          userObj.email = merged.email;
          userObj.avatarUrl = merged.avatarUrl;
          userObj.dob = merged.dob;
          userObj.dateOfBirth = merged.dob;
          userObj.gender = merged.gender;
          userObj.specialties = merged.specialties;
          userObj.certifications = merged.certifications;
          userObj.experienceYears = merged.experienceYears;
          userObj.bio = merged.bio;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) {}
      }

      return merged;
    });

    // Call backend API if possible
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const userId = updates.id || (userStr ? JSON.parse(userStr).id : '25f50fba-506a-4edf-9db7-43f77f6741a4');

      const payload = {
        fullName: updates.fullName,
        phoneNumber: updates.phone,
        email: updates.email,
        avatarUrl: updates.avatarUrl,
        dateOfBirth: updates.dob ? (updates.dob.includes('T') ? updates.dob : `${updates.dob}T00:00:00Z`) : null,
        gender: updates.gender,
        emergencyContact: updates.emergencyContact,
        specialties: updates.specialties,
        certifications: updates.certifications,
        experienceYears: updates.experienceYears != null ? Number(updates.experienceYears) : undefined,
        bio: updates.bio,
      };

      let res = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        const refreshRes = await fetch('/api/auth/dev-token', { method: 'POST' });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.token) {
            localStorage.setItem('token', refreshData.token);
            await fetch(`/api/users/${userId}/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshData.token}`,
              },
              body: JSON.stringify(payload),
            });
          }
        }
      }
    } catch (e) {
      console.warn('Backend sync profile failed, saved locally:', e);
    }
  }, []);

  return { profile, loading, updateProfile };
}
