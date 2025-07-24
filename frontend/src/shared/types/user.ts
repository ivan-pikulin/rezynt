/**
 * User interface representing authenticated user
 */
export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  lastLogin: string | null;
  personId: number | null;
} 