# 🔐 Учетные данные для входа в систему

## Проблема
Ошибка "Foydalanuvchi topilmadi" (Пользователь не найден) возникает, когда:
1. Email введен неправильно (проверьте регистр букв и опечатки)
2. Пользователь не существует в базе данных
3. База данных не заполнена (нужно запустить seed)

## Решение

### 1. Убедитесь, что база данных заполнена
```bash
cd server
npm run seed
```

### 2. Проверьте существующих пользователей
```bash
cd server
node check-users.js
```

### 3. Используйте правильные учетные данные

## 📋 Список всех пользователей

### 1. **Admin** (Администратор)
- **Email:** `admin@agrobank.uz`
- **Password:** `admin_pass_2025`
- **Role:** Admin
- **Department:** IT

### 2. **Bank apparati** (Аппарат банка)
- **Email:** `apparat@agrobank.uz`
- **Password:** `apparat_pass_2025`
- **Role:** Bank apparati
- **Department:** Bosh apparat

### 3. **Boshqaruv** (Управление)
- **Email:** `board@agrobank.uz`
- **Password:** `board_pass_2025`
- **Role:** Boshqaruv
- **Department:** Boshqaruv

### 4. **Yordamchi** (Помощник)
- **Email:** `assistant@agrobank.uz`
- **Password:** `assistant_pass_2025`
- **Role:** Yordamchi
- **Department:** Boshqaruv
- **Manager:** board@agrobank.uz

### 5. **Tarmoq - Kreditlash** (Кредитование)
- **Email:** `credit.head@agrobank.uz`
- **Password:** `credit_head_pass_2025`
- **Role:** Tarmoq
- **Department:** Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti

### 6. **Reviewer - Ijrochi** (Исполнитель)
- **Email:** `credit.reviewer@agrobank.uz`
- **Password:** `reviewer_pass_2025`
- **Role:** Reviewer
- **Department:** Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti
- **Manager:** credit.head@agrobank.uz

### 7. **Tarmoq - HR**
- **Email:** `hr.head@agrobank.uz`
- **Password:** `hr_pass_2025`
- **Role:** Tarmoq
- **Department:** HR

### 8. **Tarmoq - Yuridik** (Юридический)
- **Email:** `legal.head@agrobank.uz`
- **Password:** `legal_pass_2025`
- **Role:** Tarmoq
- **Department:** Yuridik departament

### 9. **Tarmoq - Komplaens** (Комплаенс)
- **Email:** `compliance.head@agrobank.uz`
- **Password:** `compliance_pass_2025`
- **Role:** Tarmoq
- **Department:** Komplaens nazorat departamenti

### 10. **Resepshn** (Ресепшн)
- **Email:** `reception@agrobank.uz`
- **Password:** `reception_pass_2025`
- **Role:** Resepshn
- **Department:** Bosh apparat

### 11. **Bank Kengashi kotibi** (Секретарь совета банка)
- **Email:** `council.secretary@agrobank.uz`
- **Password:** `council_pass_2025`
- **Role:** Bank Kengashi kotibi
- **Department:** Boshqaruv

### 12. **Kollegial organ kotibi** (Секретарь коллегиального органа)
- **Email:** `collegial.secretary@agrobank.uz`
- **Password:** `collegial_pass_2025`
- **Role:** Kollegial organ kotibi
- **Department:** Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti

## 🔍 Тестирование входа

Чтобы проверить конкретные учетные данные:
```bash
cd server
node test-login.js <email> <password>
```

Примеры:
```bash
node test-login.js admin@agrobank.uz admin_pass_2025
node test-login.js board@agrobank.uz board_pass_2025
node test-login.js apparat@agrobank.uz apparat_pass_2025
```

## ⚠️ Важные замечания

1. **Email чувствителен к регистру** - используйте только строчные буквы
2. **Пароли чувствительны к регистру** - копируйте их точно
3. **Проверьте, что сервер запущен** на порту 5000
4. **Проверьте, что база данных доступна** (PostgreSQL должен быть запущен)

## 🐛 Отладка

Если вход не работает:

1. Проверьте логи сервера - теперь они показывают детали попыток входа
2. Убедитесь, что вы используете правильный email (без опечаток)
3. Убедитесь, что вы используете правильный пароль
4. Проверьте, что пользователь существует: `node check-users.js`
5. Протестируйте вход через скрипт: `node test-login.js <email> <password>`

## 🔄 Перезапуск сервера

После изменений в коде обязательно перезапустите сервер:
```bash
cd server
npm run dev
```
