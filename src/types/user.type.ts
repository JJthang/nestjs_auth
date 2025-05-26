import { Role } from '@/common/enums/role.enum';

export interface User {
  email: string;
  name: string;
}

export interface SecretOtp {
  token: string;
  email: string;
}

export interface UserPayload {
  id: number;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}
