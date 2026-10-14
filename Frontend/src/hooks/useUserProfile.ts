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
  
  // Coach Profile Fields
  specialties?: string;
  certifications?: string;
  experienceYears?: number;
  bio?: string;

  // Member Profile Fields
  fitnessGoal?: string;
  favoriteSports?: string;
  preferredTime?: string;
  healthNotes?: string;
  workoutGoals?: string;
  memberTier?: string;
}

export const USER_PROFILE_UPDATED_EVENT = 'user-profile-updated';

export function detectPortalRole(portalRoleHint?: 'coach' | 'member'): 'coach' | 'member' {
  if (portalRoleHint) return portalRoleHint;
  if (typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    if (hash.startsWith('#coach')) return 'coach';
    if (hash.startsWith('#member') || hash === '#classes' || hash === '#schedule' || hash === '#pricing') return 'member';
  }
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      const r = (u.roleName || u.role || '').toLowerCase();
      if (r === 'coach') return 'coach';
    } catch {}
  }
  return 'member';
}

function getLocalProfile(portalRoleHint?: 'coach' | 'member'): UserProfile | null {
  const activeRole = detectPortalRole(portalRoleHint);
  const isCoach = activeRole === 'coach';
  const defaultId = isCoach
    ? '25f50fba-506a-4edf-9db7-43f77f6741a4'
    : 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let user: any = {};
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      const userRole = (parsed.roleName || parsed.role || '').toLowerCase();
      if ((isCoach && userRole === 'coach') || (!isCoach && userRole !== 'coach')) {
        user = parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc localStorage user:', e);
    }
  }

  const userId = user.id || user.userId || defaultId;
  const overrideStr = typeof window !== 'undefined' ? localStorage.getItem(`user_profile_${userId}`) : null;
  const override = overrideStr ? JSON.parse(overrideStr) : {};

  return {
    id: userId,
    fullName: override.fullName || user.fullName || user.name || (isCoach ? 'Hồ Xuân Ánh Nam (Coach)' : 'Hồ Xuân Ánh Nam (Member)'),
    email: override.email || user.email || (isCoach ? 'hoxuananhnam1@gmail.com' : 'hoxuananhnam@gmail.com'),
    phone: override.phone || user.phoneNumber || user.phone || (isCoach ? '0989 123 789' : '0989 123 788'),
    dob: override.dob || user.dateOfBirth || user.dob || '1998-08-15',
    gender: override.gender || user.gender || 'Nam',
    avatarUrl: override.avatarUrl || user.avatarUrl || '',
    roleName: isCoach ? 'Coach' : 'Member',
    emergencyContact: override.emergencyContact || user.emergencyContact || (isCoach ? '' : '0912 345 678 (Người thân)'),
    
    // Coach fields
    specialties: override.specialties || user.specialties || (isCoach ? 'Gym Fitness, Yoga, BodyCombat' : undefined),
    certifications: override.certifications || user.certifications || (isCoach ? 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM), Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified), Chứng chỉ Dinh dưỡng Thể thao Cơ bản' : undefined),
    experienceYears: override.experienceYears ?? user.experienceYears ?? (isCoach ? 5 : undefined),
    bio: override.bio || user.bio || (isCoach ? 'Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên.' : undefined),

    // Member fields
    fitnessGoal: override.fitnessGoal || user.fitnessGoal || 'Tăng cơ giảm mỡ, cải thiện sức bền tim mạch và duy trì thói quen tập luyện khoa học 4 buổi/tuần.',
    favoriteSports: override.favoriteSports || user.favoriteSports || 'Gym thể hình, Bơi lội, Yoga, Boxing',
    preferredTime: override.preferredTime || user.preferredTime || 'Buổi chiều tối (17:30 - 19:30)',
    healthNotes: override.healthNotes || user.healthNotes || 'Thể trạng sức khỏe tốt, không có tiền sử bệnh tim mạch hoặc chấn thương cột sống.',
    workoutGoals: override.workoutGoals || user.workoutGoals || 'Tăng cơ giảm mỡ & Săn chắc vóc dáng, Tần suất tập 4 buổi/tuần, Nâng cao sức bền tim mạch, Hoàn thành cự ly chạy 5km liên tục',
    memberTier: override.memberTier || user.memberTier || 'Hội viên Thể thao',
  };
}

export function useUserProfile(portalRoleHint?: 'coach' | 'member') {
  const [profile, setProfile] = useState<UserProfile | null>(() => getLocalProfile(portalRoleHint));
  const [loading, setLoading] = useState(true);

  // Listen to profile updates across components & windows
  useEffect(() => {
    const onProfileUpdated = (e: any) => {
      if (e.detail) {
        setProfile(prev => {
          if (!prev) return e.detail;
          // Safeguard: If the updated profile is for a different user ID, ignore it
          if (e.detail.id && prev.id && e.detail.id !== prev.id) {
            return prev;
          }
          return e.detail;
        });
      } else {
        setProfile(getLocalProfile(portalRoleHint));
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'user' || (profile?.id && e.key === `user_profile_${profile.id}`)) {
        setProfile(getLocalProfile(portalRoleHint));
      }
    };

    const onHashChange = () => {
      setProfile(getLocalProfile(portalRoleHint));
    };

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated);
    window.addEventListener('storage', onStorage);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, onProfileUpdated);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [profile?.id, portalRoleHint]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const activeRole = detectPortalRole(portalRoleHint);
        const isCoach = activeRole === 'coach';
        const defaultId = isCoach
          ? '25f50fba-506a-4edf-9db7-43f77f6741a4'
          : 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

        const userStr = localStorage.getItem('user');
        let userId = defaultId;
        let currentUserEmail = isCoach ? 'hoxuananhnam1@gmail.com' : 'hoxuananhnam@gmail.com';

        if (userStr) {
          try {
            const parsed = JSON.parse(userStr);
            const userRole = (parsed.roleName || parsed.role || '').toLowerCase();
            if ((isCoach && userRole === 'coach') || (!isCoach && userRole !== 'coach')) {
              userId = parsed.id || parsed.userId || defaultId;
              if (parsed.email) currentUserEmail = parsed.email;
            }
          } catch {}
        }

        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const overrideStr = localStorage.getItem(`user_profile_${userId}`);
        const override = overrideStr ? JSON.parse(overrideStr) : {};

        let res = await fetch(`/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401) {
          try {
            const refreshRes = await fetch('/api/auth/dev-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: isCoach ? 'coach' : 'member', email: currentUserEmail })
            });
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
          const serverRole = isCoach ? 'Coach' : 'Member';

          const freshProfile: UserProfile = {
            id: data.id || userId,
            fullName: override.fullName || data.fullName || (isCoach ? 'Hồ Xuân Ánh Nam (Coach)' : 'Hồ Xuân Ánh Nam (Member)'),
            email: override.email || data.email || (isCoach ? 'hoxuananhnam1@gmail.com' : 'hoxuananhnam@gmail.com'),
            phone: override.phone || data.phoneNumber || (isCoach ? '0989 123 789' : '0989 123 788'),
            dob: override.dob || (data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '1998-08-15'),
            gender: override.gender || data.gender || 'Nam',
            avatarUrl: override.avatarUrl || data.avatarUrl || '',
            roleName: serverRole,
            emergencyContact: override.emergencyContact || data.emergencyContact || (isCoach ? '' : '0912 345 678 (Người thân)'),
            
            // Coach fields
            specialties: override.specialties || data.specialties || (isCoach ? 'Gym Fitness, Yoga, BodyCombat' : undefined),
            certifications: override.certifications || data.certifications || (isCoach ? 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM), Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified), Chứng chỉ Dinh dưỡng Thể thao Cơ bản' : undefined),
            experienceYears: override.experienceYears ?? data.experienceYears ?? (isCoach ? 5 : undefined),
            bio: override.bio || data.bio || (isCoach ? 'Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên.' : undefined),

            // Member fields
            fitnessGoal: override.fitnessGoal || data.fitnessGoal || 'Tăng cơ giảm mỡ, cải thiện sức bền tim mạch và duy trì thói quen tập luyện khoa học 4 buổi/tuần.',
            favoriteSports: override.favoriteSports || data.favoriteSports || 'Gym thể hình, Bơi lội, Yoga, Boxing',
            preferredTime: override.preferredTime || data.preferredTime || 'Buổi chiều tối (17:30 - 19:30)',
            healthNotes: override.healthNotes || data.healthNotes || 'Thể trạng sức khỏe tốt, không có tiền sử bệnh tim mạch hoặc chấn thương cột sống.',
            workoutGoals: override.workoutGoals || data.workoutGoals || 'Tăng cơ giảm mỡ & Săn chắc vóc dáng, Tần suất tập 4 buổi/tuần, Nâng cao sức bền tim mạch, Hoàn thành cự ly chạy 5km liên tục',
            memberTier: override.memberTier || data.memberTier || 'Hội viên Thể thao',
          };

          setProfile(freshProfile);
        }
      } catch (err) {
        console.warn('Failed to fetch user profile, using local state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [portalRoleHint]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const activeRole = detectPortalRole(portalRoleHint);
    const isCoach = activeRole === 'coach';
    const defaultId = isCoach
      ? '25f50fba-506a-4edf-9db7-43f77f6741a4'
      : 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    const userStr = localStorage.getItem('user');
    let user: any = {};
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const userRole = (parsed.roleName || parsed.role || '').toLowerCase();
        if ((isCoach && userRole === 'coach') || (!isCoach && userRole !== 'coach')) {
          user = parsed;
        }
      } catch {}
    }

    const userId = updates.id || user.id || user.userId || defaultId;
    const currentLocal = getLocalProfile(portalRoleHint);
    const merged: UserProfile = {
      ...(currentLocal || {
        id: userId,
        fullName: isCoach ? 'Ho Xuan Anh' : 'Ho Xuan Anh Nam',
        email: isCoach ? 'hoxuananhnam1@gmail.com' : 'hoxuananhnam@gmail.com',
        phone: '0989 123 789',
        dob: '1998-08-15',
        gender: 'Nam',
        avatarUrl: '',
        roleName: activeRole,
        emergencyContact: isCoach ? '' : '0912 345 678 (Người thân)',
        specialties: isCoach ? 'Gym Fitness, Yoga, BodyCombat' : undefined,
        certifications: isCoach ? 'Chứng chỉ Huấn luyện viên Thể hình Quốc tế (ACE / NASM), Sơ cấp cứu & Hồi sức tim phổi (CPR / AED Certified), Chứng chỉ Dinh dưỡng Thể thao Cơ bản' : undefined,
        experienceYears: isCoach ? 5 : undefined,
        bio: isCoach ? 'Huấn luyện viên thể hình chuyên sâu về xây dựng cơ bắp, cải thiện vóc dáng và phục hồi chức năng vận động. Luôn đồng hành và truyền động lực cho học viên.' : undefined,
        fitnessGoal: 'Tăng cơ giảm mỡ, cải thiện sức bền tim mạch và duy trì thói quen tập luyện khoa học 4 buổi/tuần.',
        favoriteSports: 'Gym thể hình, Bơi lội, Yoga, Boxing',
        preferredTime: 'Buổi chiều tối (17:30 - 19:30)',
        healthNotes: 'Thể trạng sức khỏe tốt, không có tiền sử bệnh tim mạch hoặc chấn thương cột sống.',
        workoutGoals: 'Tăng cơ giảm mỡ & Săn chắc vóc dáng, Tần suất tập 4 buổi/tuần, Nâng cao sức bền tim mạch, Hoàn thành cự ly chạy 5km liên tục',
        memberTier: 'Hội viên Thể thao',
      }),
      ...updates,
    };

    // 1. Save in local storage override
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(merged));

    // 2. Sync user object in localStorage for all components reading localStorage.getItem('user')
    // ONLY IF current session belongs to this userId!
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        const currentStoredId = userObj.id || userObj.userId;
        if (!currentStoredId || currentStoredId === userId) {
          if (merged.fullName) {
            userObj.fullName = merged.fullName;
            userObj.name = merged.fullName;
          }
          if (merged.phone) {
            userObj.phone = merged.phone;
            userObj.phoneNumber = merged.phone;
          }
          if (merged.email) userObj.email = merged.email;
          if (merged.avatarUrl !== undefined) userObj.avatarUrl = merged.avatarUrl;
          if (merged.dob) {
            userObj.dob = merged.dob;
            userObj.dateOfBirth = merged.dob;
          }
          if (merged.gender) userObj.gender = merged.gender;
          if (merged.emergencyContact) userObj.emergencyContact = merged.emergencyContact;
          if (merged.specialties) userObj.specialties = merged.specialties;
          if (merged.certifications) userObj.certifications = merged.certifications;
          if (merged.experienceYears) userObj.experienceYears = merged.experienceYears;
          if (merged.bio) userObj.bio = merged.bio;
          if (merged.fitnessGoal) userObj.fitnessGoal = merged.fitnessGoal;
          if (merged.favoriteSports) userObj.favoriteSports = merged.favoriteSports;
          if (merged.preferredTime) userObj.preferredTime = merged.preferredTime;
          if (merged.healthNotes) userObj.healthNotes = merged.healthNotes;
          if (merged.workoutGoals) userObj.workoutGoals = merged.workoutGoals;
          if (merged.memberTier) userObj.memberTier = merged.memberTier;
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      } catch (e) {}
    }

    // 3. Immediately update local state
    setProfile(merged);

    // 4. Broadcast event across all components in current window
    window.dispatchEvent(new CustomEvent(USER_PROFILE_UPDATED_EVENT, { detail: merged }));
    window.dispatchEvent(new Event('storage'));

    // 5. Call backend API to persist in database
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const payload = {
        fullName: merged.fullName,
        phoneNumber: merged.phone,
        email: merged.email,
        avatarUrl: merged.avatarUrl,
        dateOfBirth: merged.dob ? (merged.dob.includes('T') ? merged.dob : `${merged.dob}T00:00:00Z`) : null,
        gender: merged.gender,
        emergencyContact: merged.emergencyContact,
        specialties: merged.specialties,
        certifications: merged.certifications,
        experienceYears: merged.experienceYears != null ? Number(merged.experienceYears) : undefined,
        bio: merged.bio,
        fitnessGoal: merged.fitnessGoal,
        favoriteSports: merged.favoriteSports,
        preferredTime: merged.preferredTime,
        healthNotes: merged.healthNotes,
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
        const refreshRes = await fetch('/api/auth/dev-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: isCoach ? 'coach' : 'member', email: user.email })
        });
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
