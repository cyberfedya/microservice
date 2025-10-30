# Реализация регламента контроля исполнительской дисциплины

## Обзор

Данная система реализует регламент банка "Agrobank" по контролю исполнительской дисциплины согласно документу "Bank tizimida ijro intizomini tashkil etish va nazorat faoliyati bo'yicha REGLAMENT".

## Реализованный функционал

### Backend (Node.js + Express + Prisma)

#### 1. Сервис контроля дисциплины (`server/src/discipline.service.ts`)

**Основные функции:**

- `checkOverdueDocuments()` - Проверка просроченных документов и автоматическое создание нарушений
- `createViolationForUser()` - Создание нарушения с автоматическим определением типа наказания согласно п.12 регламента:
  - 1-е нарушение: Предупреждение (Ogohlantirish)
  - 2-е нарушение: Выговор (Hayfsan)
  - 3-е нарушение: Штраф 30% (30% jarima)
  - 4-е нарушение: Штраф 50% (50% jarima)
  - 5-е нарушение: Расторжение договора (Mehnat shartnomasini bekor qilish)

- `checkUpcomingDeadlines()` - Мониторинг документов с приближающимся дедлайном (п.14 регламента - уведомление за 1 день)
- `getUserViolationStats()` - Статистика нарушений по пользователю
- `getDepartmentViolationStats()` - Статистика нарушений по отделу
- `getDisciplineReport()` - Отчет по исполнительской дисциплине с фильтрами
- `getDocumentMonitoringStats()` - Статистика мониторинга документов

#### 2. API Endpoints (`server/src/discipline.routes.ts`)

**Доступные маршруты:**

```
POST /api/discipline/check-overdue
```
- Проверка просроченных документов
- Доступ: Admin, Bank apparati

```
POST /api/discipline/check-upcoming
```
- Проверка приближающихся дедлайнов
- Доступ: Admin, Bank apparati

```
POST /api/discipline/violations
```
- Создание нарушения вручную
- Доступ: Admin, Bank apparati, Boshqaruv

```
GET /api/discipline/violations/user/:userId
```
- Статистика нарушений пользователя
- Доступ: Сам пользователь или руководители

```
GET /api/discipline/violations/department/:departmentId
```
- Статистика нарушений по отделу
- Доступ: Admin, Bank apparati, Boshqaruv, Tarmoq (только свой отдел)

```
GET /api/discipline/report?startDate=&endDate=&departmentId=&userId=
```
- Отчет по исполнительской дисциплине
- Доступ: Admin, Bank apparati, Boshqaruv

```
GET /api/discipline/monitoring
```
- Статистика мониторинга документов
- Доступ: Admin, Bank apparati, Boshqaruv

### Frontend (React + TypeScript)

#### 1. Компонент мониторинга (`components/DisciplineMonitoringSimple.tsx`)

**Функционал:**

- **Вкладка "Hujjatlar monitoringi":**
  - Отображение активных документов
  - Просроченные документы (красный индикатор)
  - Документы с приближающимся дедлайном (желтый индикатор)
  - Статистика по этапам документооборота
  - Статистика по картотекам (важность документов)

- **Вкладка "Buzilishlar hisoboti":**
  - Общее количество нарушений
  - Разбивка по типам наказаний
  - Статистика по отделам
  - Список последних нарушений с деталями

- **Действия:**
  - Кнопка "Muddati o'tganlarni tekshirish" - запуск проверки просроченных документов
  - Кнопка "Yaqinlashuvchilarni xabarlash" - отправка уведомлений о приближающихся дедлайнах

#### 2. Роутинг

Добавлен новый маршрут в приложении:
```
/monitoring - Страница мониторинга исполнительской дисциплины
```

## Соответствие регламенту

### Пункт 11 - Полномочия Bank apparati
✅ Bank apparati имеет право требовать информацию и применять дисциплинарные меры

### Пункт 12 - Типы нарушений
✅ Реализована автоматическая система наказаний:
- 1-е: Предупреждение
- 2-е: Выговор
- 3-е: Штраф 30%
- 4-е: Штраф 50%
- 5-е: Расторжение договора

### Пункт 13 - Полномочия Boshqaruv raisi
✅ Boshqaruv raisi имеет абсолютные полномочия по применению дисциплинарных мер

### Пункт 14 - Уведомление за день до срока
✅ Функция `checkUpcomingDeadlines()` отправляет уведомления за 1 день до дедлайна

### Пункт 15 - Продление сроков
✅ Система учитывает продление сроков через существующий функционал `updateDeadline()`

## Автоматизация

Рекомендуется настроить cron jobs для автоматического запуска:

1. **Проверка просроченных документов** - ежедневно в 00:00
```bash
# Пример cron задачи
0 0 * * * curl -X POST http://localhost:5000/api/discipline/check-overdue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. **Уведомление о приближающихся дедлайнах** - ежедневно в 09:00
```bash
# Пример cron задачи
0 9 * * * curl -X POST http://localhost:5000/api/discipline/check-upcoming \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## База данных

Используется существующая таблица `Violation` из Prisma схемы:

```prisma
model Violation {
  id               Int       @id @default(autoincrement())
  date             DateTime
  reason           String
  type             String    // Тип взыскания
  userId           Int
  user             User      @relation(fields: [userId], references: [id])
  correspondenceId Int?      // ID связанного документа
  correspondence   Document? @relation(fields: [correspondenceId], references: [id])
}
```

## Уведомления

Система автоматически создает уведомления:
- Для пользователя при создании нарушения
- Для руководителя пользователя
- Для исполнителей при приближении дедлайна

## Права доступа

| Роль | Просмотр статистики | Создание нарушений | Проверка документов |
|------|---------------------|-------------------|---------------------|
| Admin | ✅ Все | ✅ | ✅ |
| Bank apparati | ✅ Все | ✅ | ✅ |
| Boshqaruv | ✅ Все | ✅ | ❌ |
| Tarmoq | ✅ Свой отдел | ❌ | ❌ |
| Другие | ✅ Только свои | ❌ | ❌ |

## Запуск системы

1. Убедитесь, что база данных настроена и миграции применены
2. Запустите backend сервер:
```bash
cd server
npm run dev
```

3. Запустите frontend:
```bash
npm run dev
```

4. Откройте приложение и перейдите на страницу `/monitoring`

## Тестирование

Для тестирования функционала:

1. Создайте документы с истекшим сроком
2. Назначьте исполнителей
3. Запустите проверку через кнопку "Muddati o'tganlarni tekshirish"
4. Проверьте создание нарушений в разделе "Buzilishlar hisoboti"

## Дальнейшее развитие

Возможные улучшения:
- Экспорт отчетов в Excel/PDF
- Графики и диаграммы статистики
- Email уведомления
- SMS уведомления для критичных случаев
- Интеграция с системой KPI
- Автоматическое применение штрафов в зарплатной системе
