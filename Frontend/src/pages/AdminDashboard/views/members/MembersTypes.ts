export interface MemberItem {
  id: string;
  realId: string;
  name: string;
  phone: string;
  email: string;
  roleName: string;
  pkg: string;
  vip: boolean;
  status: string;
  statusRaw: boolean;
  expiry: string;
  avatar: string | null;
  dob: string;
  gender?: string | null;
  emergencyContact?: string | null;
}

export interface UserTabOption {
  label: string;
  filter: (u: MemberItem) => boolean;
}
