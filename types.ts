export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  managerId?: number;
}

export interface Department {
  id: number;
  name: string;
  parentId?: number;
}

export interface Role {
  id: number | string;
  name: string;
  description: string;
}

export interface Violation {
  id: number;
  userId: number;
  correspondenceId?: number;
  date: string;
  reason: string;
  type: string;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  details?: string | null;
  createdAt: string;
  user?: { name: string | null };
}

export interface Correspondence {
  id: number;
  title: string;
  content: string | null;
  type: 'Kiruvchi' | 'Chiquvchi';
  stage: string;
  status: string;
  source: string | null;
  kartoteka: string | null;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  author: { id: number; name: string | null };
  mainExecutor: { id: number; name: string | null; department: { name: string } } | null;
  internalAssignee: { id: number; name: string | null } | null;
  coExecutors: { user: { id: number; name: string | null } }[];
  contributors: { user: { id: number; name: string | null } }[];
  reviewers: { user: { id: number; name: string | null }; status: 'PENDING' | 'APPROVED' | 'REJECTED' }[];
  auditLog: AuditLogEntry[];
}

export interface Notification {
  id: number;
  message: string;
  link?: string;
  createdAt: string;
}