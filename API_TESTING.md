# 🧪 ТЕСТИРОВАНИЕ API - Все реализованные endpoints

## 🔐 АВТОРИЗАЦИЯ (сначала получи токен)

### 1. Логин
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```
**Ответ:** Получишь `token` - скопируй его!

---

## ✅ ЧТО РЕАЛИЗОВАНО И КАК ПРОВЕРИТЬ:

### 📄 1. ЭТАПЫ ОБРАБОТКИ ДОКУМЕНТОВ (document-stages)

#### Получить все этапы документа
```http
GET http://localhost:5000/api/documents/stages/1
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Перевести документ на следующий этап
```http
POST http://localhost:5000/api/documents/stages/1/advance
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "notes": "Документ проверен"
}
```

#### Получить просроченные документы
```http
GET http://localhost:5000/api/documents/stages/overdue
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Статистика по этапам
```http
GET http://localhost:5000/api/documents/stages/statistics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### ⚠️ 2. ДИСЦИПЛИНАРНЫЕ МЕРЫ (disciplinary)

#### Создать дисциплинарное взыскание
```http
POST http://localhost:5000/api/disciplinary/actions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "userId": 1,
  "level": "OGOHLANTIRISH",
  "reason": "Просрочка документа",
  "documentId": 1
}
```

#### Получить взыскания пользователя
```http
GET http://localhost:5000/api/disciplinary/actions/user/1
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Статистика по дисциплине
```http
GET http://localhost:5000/api/disciplinary/statistics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 🏛️ 3. KOLLEGIAL ORGANLAR (5 комитетов)

#### Получить все коллегиальные органы
```http
GET http://localhost:5000/api/collegial/bodies
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Создать коллегиальный орган
```http
POST http://localhost:5000/api/collegial/bodies
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "type": "KREDIT",
  "name": "Кредитный комитет",
  "description": "Комитет по кредитным вопросам",
  "chairmanId": 1,
  "secretaryId": 2
}
```

#### Добавить члена комитета
```http
POST http://localhost:5000/api/collegial/bodies/1/members
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "userId": 3,
  "role": "Член комитета",
  "isVotingMember": true
}
```

#### Создать заседание
```http
POST http://localhost:5000/api/collegial/bodies/1/meetings
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Заседание кредитного комитета",
  "scheduledDate": "2025-11-01T10:00:00Z",
  "location": "Конференц-зал",
  "agenda": [
    {
      "orderNumber": 1,
      "topic": "Рассмотрение кредитной заявки",
      "description": "Заявка от компании ABC",
      "presenterId": 1,
      "duration": 30
    }
  ]
}
```

#### Отметить посещаемость
```http
POST http://localhost:5000/api/collegial/meetings/1/attendance
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "userId": 3,
  "attended": true,
  "vote": "ZA"
}
```

#### Добавить решение
```http
POST http://localhost:5000/api/collegial/meetings/1/decisions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "decision": "Одобрить кредит на сумму 100 млн сум",
  "votesFor": 5,
  "votesAgainst": 0,
  "votesAbstain": 1,
  "responsible": "Иванов И.И.",
  "deadline": "2025-11-15T00:00:00Z"
}
```

#### Создать протокол
```http
POST http://localhost:5000/api/collegial/meetings/1/protocol
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "protocolNumber": "КК-2025-001",
  "content": "Протокол заседания кредитного комитета..."
}
```

#### Статистика комитета
```http
GET http://localhost:5000/api/collegial/bodies/1/statistics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 📦 4. АРХИВ (archive)

#### Создать экспертную комиссию
```http
POST http://localhost:5000/api/archive/commission
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Центральная экспертная комиссия",
  "chairmanId": 1,
  "secretaryId": 2
}
```

#### Создать экспертизу документа
```http
POST http://localhost:5000/api/archive/expertise
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "commissionId": 1,
  "documentValue": "TEMPORARY_5_YEARS",
  "decision": "Хранить 5 лет"
}
```

#### Архивировать документ
```http
POST http://localhost:5000/api/archive/store
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "archiveNumber": "ARH-2025-001",
  "shelfLocation": "Полка A-1",
  "boxNumber": "Коробка 15"
}
```

#### Запрос на выдачу документа
```http
POST http://localhost:5000/api/archive/request
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "reason": "Для проверки"
}
```

#### Одобрить запрос
```http
POST http://localhost:5000/api/archive/request/1/approve
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Статистика архива
```http
GET http://localhost:5000/api/archive/statistics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 📝 5. USTXAT СИСТЕМА (резолюции)

#### Создать резолюцию
```http
POST http://localhost:5000/api/ustxat/create
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "text": "Подготовить отчет до 15 ноября",
  "deadline": "2025-11-15T00:00:00Z",
  "mainExecutorId": 3,
  "equalExecutors": [4, 5],
  "coExecutors": [6],
  "assistantId": 7,
  "priority": "HIGH"
}
```

#### Получить резолюции документа
```http
GET http://localhost:5000/api/ustxat/document/1
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Переназначить исполнителя
```http
POST http://localhost:5000/api/ustxat/reassign
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "newExecutorId": 8,
  "reason": "Предыдущий исполнитель в отпуске"
}
```

#### Добавить комментарий
```http
POST http://localhost:5000/api/ustxat/comment
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "comment": "Работа выполнена на 50%"
}
```

#### Завершить выполнение
```http
POST http://localhost:5000/api/ustxat/complete
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "documentId": 1,
  "completionNotes": "Отчет подготовлен и отправлен"
}
```

#### Мои документы по роли
```http
GET http://localhost:5000/api/ustxat/my-documents/MAIN
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Статистика
```http
GET http://localhost:5000/api/ustxat/statistics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 📊 6. HISOBOT TIZIMI (Отчетность) - НОВОЕ!

#### Создать отчет
```http
POST http://localhost:5000/api/reports/create
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Месячный отчет за октябрь 2025",
  "reportType": "OYLIK",
  "year": 2025,
  "month": 10,
  "departmentId": 1,
  "content": "Содержание отчета..."
}
```

#### Добавить метрику к отчету
```http
POST http://localhost:5000/api/reports/1/metrics
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "metricName": "Обработано документов",
  "metricValue": 150,
  "targetValue": 200,
  "unit": "шт",
  "description": "Количество обработанных документов"
}
```

#### Отправить отчет на утверждение
```http
POST http://localhost:5000/api/reports/1/submit
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Утвердить отчет
```http
POST http://localhost:5000/api/reports/1/approve
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Отклонить отчет
```http
POST http://localhost:5000/api/reports/1/reject
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "rejectionReason": "Недостаточно данных"
}
```

#### Получить отчеты
```http
GET http://localhost:5000/api/reports?reportType=OYLIK&year=2025&month=10
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Сгенерировать отчет по дисциплине
```http
POST http://localhost:5000/api/reports/discipline/generate
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "reportType": "OYLIK",
  "year": 2025,
  "month": 10,
  "departmentId": 1
}
```

#### Получить отчеты по дисциплине
```http
GET http://localhost:5000/api/reports/discipline?year=2025&month=10
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Сгенерировать отчет по документообороту
```http
POST http://localhost:5000/api/reports/docflow/generate
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "reportType": "CHORAKLIK",
  "year": 2025,
  "quarter": 4
}
```

#### Получить отчеты по документообороту
```http
GET http://localhost:5000/api/reports/docflow?year=2025
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Статистика отчетности
```http
GET http://localhost:5000/api/reports/statistics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🚀 КАК ТЕСТИРОВАТЬ:

### Вариант 1: Thunder Client (в VS Code)
1. Установи расширение "Thunder Client"
2. Создай новый Request
3. Скопируй URL и данные из примеров выше
4. Добавь токен в Headers: `Authorization: Bearer YOUR_TOKEN`

### Вариант 2: Postman
1. Открой Postman
2. Создай новую коллекцию "Microservice API"
3. Добавь requests из примеров выше
4. В Headers добавь: `Authorization: Bearer YOUR_TOKEN`

### Вариант 3: curl (в терминале)
```bash
# Сначала получи токен
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Потом используй токен
curl -X GET http://localhost:5000/api/collegial/bodies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ ПРОВЕРОЧНЫЙ СПИСОК:

### Этапы обработки:
- [ ] Получить этапы документа
- [ ] Перевести на следующий этап
- [ ] Получить просроченные
- [ ] Статистика

### Дисциплина:
- [ ] Создать взыскание
- [ ] Получить взыскания пользователя
- [ ] Статистика

### Kollegial organlar:
- [ ] Создать орган
- [ ] Добавить члена
- [ ] Создать заседание
- [ ] Отметить посещаемость
- [ ] Добавить решение
- [ ] Создать протокол
- [ ] Статистика

### Архив:
- [ ] Создать комиссию
- [ ] Создать экспертизу
- [ ] Архивировать документ
- [ ] Запрос на выдачу
- [ ] Одобрить запрос
- [ ] Статистика

### Ustxat:
- [ ] Создать резолюцию
- [ ] Переназначить
- [ ] Добавить комментарий
- [ ] Завершить
- [ ] Мои документы
- [ ] Статистика

### Отчетность:
- [ ] Создать отчет
- [ ] Добавить метрику
- [ ] Отправить на утверждение
- [ ] Утвердить/Отклонить
- [ ] Сгенерировать отчет по дисциплине
- [ ] Сгенерировать отчет по документообороту
- [ ] Статистика

---

## 🔥 БЫСТРЫЙ СТАРТ:

1. **Запусти backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Получи токен:**
   - POST `http://localhost:5000/api/auth/login`
   - Email: `admin@example.com`
   - Password: `password123`

3. **Тестируй любой endpoint** из списка выше!

---

## 📝 ПРИМЕЧАНИЕ:

- Все endpoints требуют авторизацию (токен)
- Некоторые endpoints требуют роль Admin
- ID документов, пользователей и т.д. должны существовать в БД
- Если получаешь ошибку 404 - проверь, что ID существует

**ВСЕ 49 ENDPOINTS ГОТОВЫ К ТЕСТИРОВАНИЮ!** 🚀
