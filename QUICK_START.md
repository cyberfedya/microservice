# Быстрый старт - Система контроля исполнительской дисциплины

## Что было добавлено

### 1. Виджет на главной странице (DEVONXONA)
В левой боковой панели теперь отображается виджет мониторинга для руководителей (Admin, Bank apparati, Boshqaruv):

- **Faol** - количество активных документов
- **Kechikkan** - просроченные документы (красным)
- **Yaqin** - документы с приближающимся дедлайном (желтым)

При клике на виджет открывается полная страница мониторинга `/monitoring`

### 2. Страница полного мониторинга
Доступна по адресу: `http://localhost:5173/#/monitoring`

**Вкладка "Hujjatlar monitoringi":**
- Статистика активных документов
- Просроченные документы
- Документы с приближающимся дедлайном (3 дня)
- Разбивка по этапам (EXECUTION, SIGNATURE и т.д.)
- Разбивка по картотекам (важность)

**Вкладка "Buzilishlar hisoboti":**
- Общее количество нарушений
- Типы наказаний (предупреждение, выговор, штрафы)
- Статистика по отделам
- Список последних нарушений с деталями

**Действия:**
- Кнопка "Muddati o'tganlarni tekshirish" - проверяет все просроченные документы и создает нарушения
- Кнопка "Yaqinlashuvchilarni xabarlash" - отправляет уведомления исполнителям

## Как запустить

### 1. Запустите backend сервер
```bash
cd server
npm run dev
```
Сервер запустится на `http://localhost:5000`

### 2. Запустите frontend
```bash
# В корневой папке проекта
npm run dev
```
Frontend запустится на `http://localhost:5173`

### 3. Войдите в систему
Используйте учетные данные пользователя с ролью:
- **Admin**
- **Bank apparati**
- **Boshqaruv**

Только эти роли видят виджет мониторинга и имеют доступ к странице `/monitoring`

## Что работает автоматически

### Система наказаний (п.12 регламента)
При создании нарушения система автоматически определяет тип наказания:

1. **1-е нарушение** → Ogohlantirish (Предупреждение)
2. **2-е нарушение** → Hayfsan (Выговор)
3. **3-е нарушение** → 30% jarima (Штраф 30%)
4. **4-е нарушение** → 50% jarima (Штраф 50%)
5. **5-е нарушение** → Mehnat shartnomasini bekor qilish (Расторжение)

### Уведомления
Система автоматически создает уведомления:
- Для пользователя при создании нарушения
- Для руководителя пользователя
- Для исполнителей при приближении дедлайна

## API Endpoints

Все endpoints доступны по адресу `http://localhost:5000/api/discipline/`

### Проверка просроченных документов
```bash
POST /api/discipline/check-overdue
Authorization: Bearer YOUR_TOKEN
```

### Проверка приближающихся дедлайнов
```bash
POST /api/discipline/check-upcoming
Authorization: Bearer YOUR_TOKEN
```

### Создание нарушения вручную
```bash
POST /api/discipline/violations
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "userId": 1,
  "documentId": 5,
  "reason": "Hujjat muddatida bajarilmadi"
}
```

### Получение статистики мониторинга
```bash
GET /api/discipline/monitoring
Authorization: Bearer YOUR_TOKEN
```

### Получение отчета по дисциплине
```bash
GET /api/discipline/report?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer YOUR_TOKEN
```

## Тестирование

### Шаг 1: Создайте тестовый документ с истекшим сроком
1. Войдите как Admin
2. Создайте новый документ (кнопка "+ Yangi hujjat")
3. Назначьте исполнителя
4. Установите дедлайн на вчерашнюю дату

### Шаг 2: Запустите проверку
1. Перейдите на страницу `/monitoring`
2. Нажмите кнопку "Muddati o'tganlarni tekshirish"
3. Система создаст нарушение для исполнителя

### Шаг 3: Проверьте результаты
1. Перейдите на вкладку "Buzilishlar hisoboti"
2. Увидите новое нарушение в списке
3. Проверьте уведомления (колокольчик в правом верхнем углу)

## Автоматизация (опционально)

Для автоматической проверки документов настройте cron задачи:

### Windows (Task Scheduler)
Создайте задачу, которая выполняет:
```powershell
curl -X POST http://localhost:5000/api/discipline/check-overdue -H "Authorization: Bearer YOUR_TOKEN"
```

### Linux/Mac (crontab)
```bash
# Проверка просроченных - каждый день в 00:00
0 0 * * * curl -X POST http://localhost:5000/api/discipline/check-overdue -H "Authorization: Bearer YOUR_TOKEN"

# Уведомления о дедлайнах - каждый день в 09:00
0 9 * * * curl -X POST http://localhost:5000/api/discipline/check-upcoming -H "Authorization: Bearer YOUR_TOKEN"
```

## Структура файлов

### Backend
- `server/src/discipline.service.ts` - Бизнес-логика контроля дисциплины
- `server/src/discipline.routes.ts` - API endpoints
- `server/src/index.ts` - Регистрация роутов

### Frontend
- `components/DisciplineWidget.tsx` - Виджет для главной страницы
- `components/DisciplineMonitoringSimple.tsx` - Полная страница мониторинга
- `components/Devonxona.tsx` - Главная страница (добавлен виджет)
- `App.tsx` - Роутинг (добавлен роут `/monitoring`)

## Права доступа

| Роль | Виджет на главной | Страница /monitoring | Создание нарушений | Проверка документов |
|------|-------------------|----------------------|-------------------|---------------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Bank apparati | ✅ | ✅ | ✅ | ✅ |
| Boshqaruv | ✅ | ✅ | ✅ | ❌ |
| Tarmoq | ❌ | ❌ | ❌ | ❌ |
| Другие | ❌ | ❌ | ❌ | ❌ |

## Поддержка

Если что-то не работает:

1. Проверьте, что backend сервер запущен (`http://localhost:5000`)
2. Проверьте, что frontend запущен (`http://localhost:5173`)
3. Проверьте консоль браузера (F12) на наличие ошибок
4. Проверьте логи backend сервера
5. Убедитесь, что вы вошли с правильной ролью (Admin/Bank apparati/Boshqaruv)

## Что дальше

Возможные улучшения:
- [ ] Экспорт отчетов в Excel
- [ ] Графики статистики (Chart.js)
- [ ] Email уведомления
- [ ] SMS уведомления
- [ ] Интеграция с KPI системой
- [ ] Автоматическое применение штрафов
