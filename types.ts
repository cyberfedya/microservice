// C:\Users\aliak\Desktop\Док-оборот\microservice\types.ts
// --- ИЗМЕНЕННЫЙ ФАЙЛ ---

// docmanageapp/types.ts

// --- Базовые типы для Ролей и Департаментов ---
export interface Role {
    id: number; // ID должен быть числом, как в базе данных
    name: string;
    description?: string; // Описание может отсутствовать
}

export interface Department {
    id: number; // ID должен быть числом
    name: string;
    parentId?: number | null; // Для иерархии департаментов
    children?: Department[]; // Дочерние департаменты
}

// --- Тип для Пользователя ---
// Теперь User содержит полные объекты Role и Department, а также departmentId и departmentName
export interface User {
    id: number;
    name: string;
    email: string;
    role: Role; // Используем интерфейс Role
    department: Department; // Используем интерфейс Department
    departmentId?: number; // ID департамента (для удобства)
    departmentName?: string; // Имя департамента (для удобства)
    managerId?: number | null;
}

// --- Типы для Документов (Correspondence) ---
export interface DocumentReviewer {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comment?: string | null;
    updatedAt: string;
    user: { id: number; name: string; };
}

export interface DocumentCoExecutor {
    user: { id: number; name: string; };
}

export interface DocumentContributor {
    user: { id: number; name: string; };
}

export interface DocumentAuditLog {
    id: number;
    action: string;
    details?: string | null;
    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    timestamp: string; // Было createdAt, но в schema.prisma и в сервисе используется timestamp
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
    user?: { name: string; } | null; // Пользователь может быть null для системных действий
}

export interface Correspondence {
    id: number;
    title: string;
    content?: string | null; // Сделал content необязательным, как в Prisma
    type: 'Kiruvchi' | 'Chiquvchi';
    stage: string; // Используем string, т.к. enum CorrespondenceStage импортируется отдельно
    status: string; // Используем string для статуса, как в Prisma
    deadline?: string | null; // Дата может отсутствовать
    kartoteka?: string | null; // Может отсутствовать
    source?: string | null; // Источник может отсутствовать

    createdAt: string;
    updatedAt: string;

    author: { id: number; name: string; }; // Имя автора должно быть string
    mainExecutor?: { id: number; name: string; department: { name: string; }; } | null; // Имя исполнителя string
    internalAssignee?: { id: number; name: string; } | null; // Имя исполнителя string
    reviewers?: DocumentReviewer[] | null;
    coExecutors?: DocumentCoExecutor[] | null;
    contributors?: DocumentContributor[] | null;
    auditLogs?: DocumentAuditLog[] | null;
}

// --- Тип для Нарушений ---
export interface Violation {
    id: number;
    date: string;
    reason: string;
    type: string;
    user: { id: number; name: string };
    correspondence?: { id: number; title: string } | null;
}

// --- Тип для Уведомлений ---
export interface Notification {
    id: number;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
    userId: number;
}