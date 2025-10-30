// docmanageapp/services/api.ts

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- Вспомогательная функция для заголовков ---
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// --- Вспомогательная функция для обработки ответа (ИСПРАВЛЕННАЯ ВЕРСИЯ) ---
async function handleResponse(res: Response) {
  if (!res.ok) { // Если статус ошибки (4xx, 5xx)
    let errorData = null;
    let errorText = `Request failed with status ${res.status}`; // Запасной текст ошибки

    try {
        // Пытаемся прочитать тело как JSON. Это действие "потребляет" тело ответа.
        errorData = await res.json();
        // Если получилось, используем сообщение из JSON
        errorText = errorData?.error || JSON.stringify(errorData);
    } catch (e) {
        // Если не получилось прочитать как JSON (например, сервер вернул обычный текст или HTML)
        // Мы НЕ можем снова вызвать res.text() здесь, так как тело уже прочитано (или была ошибка при чтении).
        // Используем запасной текст ошибки со статусом.
        console.warn(`API Error (${res.status}): Response body was not valid JSON.`);
    }
    // Бросаем ошибку с текстом, который удалось получить.
    throw new Error(errorText);
  }

  // Обработка успешных ответов
  if (res.status === 204) { // No Content
    return null; // Успешно, но нет тела ответа
  }

  // Если ответ OK и не 204, ожидаем JSON
  try {
    return await res.json(); // Читаем и возвращаем JSON
  } catch (jsonParseError) {
      console.error("Failed to parse successful response body as JSON:", jsonParseError);
      // Если успешный ответ не парсится как JSON, это странно. Бросаем ошибку.
      // Попытаемся прочитать как текст для лога, но это может вызвать "body stream already read", если res.json() частично прочитал поток
      try {
          // Важно: Клонируем ответ перед попыткой чтения как текст,
          // так как тело может быть уже частично прочитано res.json()
          const clonedRes = res.clone();
          const bodyText = await clonedRes.text();
          console.error("Response body text:", bodyText);
      } catch (textReadError) {
          console.error("Could not read response body text after JSON parse failed.");
      }
      throw new Error("Received successful status, but failed to parse response body as JSON.");
  }
}


// --- Авторизация ---
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // getAuthHeaders здесь не нужен
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data.token) localStorage.setItem("token", data.token);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

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
  await handleResponse(res);
  return true;
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
  roleData: { description: string }
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
  await handleResponse(res);
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

export async function createIncomingTask(
  title: string,
  content: string,
  source: string,
  kartoteka: string
) {
  const res = await fetch(`${API_BASE}/api/correspondences/incoming`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, source, kartoteka }),
  });
  return handleResponse(res);
}

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

export async function holdCorrespondence(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/hold`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function cancelCorrespondence(documentId: number, reason: string) {
    if (!reason || reason.trim() === "") throw new Error("Cancellation reason is required");
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
}

export async function updateDeadline(documentId: number, deadlines: { deadline?: string | null }) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/deadline`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(deadlines),
    });
    return handleResponse(res);
}

interface ExecutorsPayload {
    mainExecutorId?: number | null;
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

export async function assignInternalEmployee(documentId: number, internalAssigneeId: number) {
     const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/delegate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ internalAssigneeId }),
    });
    return handleResponse(res);
}

export async function archiveDocument(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/archive`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function unarchiveDocument(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/unarchive`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

// --- END: НОВЫЕ/ИСПРАВЛЕННЫЕ ФУНКЦИИ ---