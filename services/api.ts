// docmanageapp/services/api.ts

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- Вспомогательная функция для заголовков ---
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  // Если токена нет, не добавляем заголовок Authorization,
  // чтобы публичные маршруты (например, логин) работали.
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// --- Вспомогательная функция для обработки ответа ---
async function handleResponse(res: Response) {
    if (!res.ok) {
        let errorData;
        try {
            // Пытаемся распарсить JSON ошибки
            errorData = await res.json();
        } catch (e) {
            // Если не JSON, читаем как текст
            errorData = { error: await res.text() || res.statusText };
        }
        // Бросаем ошибку с сообщением из ответа или статусом
        throw new Error(errorData?.error || `Request failed with status ${res.status}`);
    }
    // Если статус 204 No Content (например, при удалении), возвращаем null или true
    if (res.status === 204) {
        return null; // Или можно вернуть true, в зависимости от ожиданий
    }
    // В остальных случаях парсим JSON
    return res.json();
}


// --- Авторизация ---
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // getAuthHeaders здесь не нужен
    body: JSON.stringify({ email, password }),
  });
  // Обработка ответа через handleResponse
  const data = await handleResponse(res);
  if (data.token) localStorage.setItem("token", data.token);
  // Сохраняем пользователя в localStorage для быстрого доступа при перезагрузке
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

// --- Регистрация не используется, можно удалить или оставить ---
// export async function register(email: string, name: string, password: string) { ... }


// --- Управление пользователями ---
export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function addUser(userData: any) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function updateUser(userId: number, userData: any) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function deleteUser(userId: number) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  // Для DELETE handleResponse вернет null при успехе (204)
  await handleResponse(res);
  return true; // Возвращаем true для индикации успеха
}

// --- Управление Ролями и Департаментами ---
export async function getRoles() {
  const res = await fetch(`${API_BASE}/api/roles`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function addRole(roleData: { name: string; description: string }) {
  const res = await fetch(`${API_BASE}/api/roles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });
  return handleResponse(res);
}

export async function updateRole(
  roleId: number,
  roleData: { description: string } // Обновляем только описание
) {
  const res = await fetch(`${API_BASE}/api/roles/${roleId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });
  return handleResponse(res);
}

export async function deleteRole(roleId: number) {
  const res = await fetch(`${API_BASE}/api/roles/${roleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleResponse(res); // Вернет null при успехе
  return true;
}

export async function getDepartments() {
  const res = await fetch(`${API_BASE}/api/departments`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// --- Управление Документами ---
export async function getCorrespondences() {
  const res = await fetch(`${API_BASE}/api/correspondences`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function getCorrespondenceById(id: number) {
  const res = await fetch(`${API_BASE}/api/correspondences/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Создание входящего
export async function createIncomingTask(
  title: string,
  content: string,
  source: string,
  kartoteka: string // Добавлен параметр
) {
  const res = await fetch(`${API_BASE}/api/correspondences/incoming`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, source, kartoteka }), // Передаем kartoteka
  });
  return handleResponse(res);
}

// Создание исходящего
export async function createOutgoingCorrespondence(data: { title: string; content: string; kartoteka: string; }) {
    const res = await fetch(`${API_BASE}/api/correspondences/outgoing`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

// --- Функции для Жизненного Цикла Документа ---
export async function submitForReview(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/submit-review`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function approveReview(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/approve-review`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function rejectReview(documentId: number, comment: string) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/reject-review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment }),
    });
    return handleResponse(res);
}

export async function signDocument(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/sign`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function dispatchDocument(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/dispatch`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

// --- Управление Нарушениями (Violations) ---
interface ViolationData {
    userId: number;
    reason: string;
    type: string;
    date: string; // ISO string date
    correspondenceId?: number | null;
}

export async function getAllViolations() {
    const res = await fetch(`${API_BASE}/api/violations`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function createViolation(violationData: ViolationData) {
    const res = await fetch(`${API_BASE}/api/violations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(violationData),
    });
    return handleResponse(res);
}

// --- Управление Уведомлениями ---
export async function getNotifications() {
    const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function markNotificationAsRead(notificationId: number) {
    const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    await handleResponse(res); // Ожидаем 204 No Content
    return true;
}


// --- START: НОВЫЕ/ИСПРАВЛЕННЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ДОКУМЕНТАМИ ---

// Функция для постановки документа на паузу
export async function holdCorrespondence(documentId: number) {
    // Используем эндпоинт, который мы добавили в controller/routes
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/hold`, {
        method: 'POST',
        headers: getAuthHeaders(),
        // Тело запроса не нужно
    });
    return handleResponse(res); // Возвращаем обновленный документ
}

// Функция для отмены документа
export async function cancelCorrespondence(documentId: number, reason: string) {
    if (!reason || reason.trim() === "") throw new Error("Cancellation reason is required");
    // Используем эндпоинт, который мы добавили
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }), // Отправляем причину в теле
    });
    return handleResponse(res); // Возвращаем обновленный документ
}

// Функция для обновления дедлайна
export async function updateDeadline(documentId: number, deadlines: { deadline?: string | null }) { // Принимает deadline: string | null
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/deadline`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(deadlines), // Отправляем { deadline: "YYYY-MM-DD" } или { deadline: null }
    });
    return handleResponse(res);
}

// Функция для обновления всех исполнителей
interface ExecutorsPayload {
    mainExecutorId?: number | null; // Разрешаем null для снятия
    coExecutorIds?: number[];
    contributorIds?: number[];
}
export async function updateExecutors(documentId: number, payload: ExecutorsPayload) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/executors`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

// Функция для назначения внутреннего исполнителя
export async function assignInternalEmployee(documentId: number, internalAssigneeId: number) {
     const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/delegate`, { // Используем правильный эндпоинт
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ internalAssigneeId }), // Отправляем ID в теле
    });
    return handleResponse(res);
}

// --- END: НОВЫЕ/ИСПРАВЛЕННЫЕ ФУНКЦИИ ---