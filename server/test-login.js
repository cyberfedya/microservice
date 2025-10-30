// Скрипт для тестирования логина
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin(email, password) {
  console.log(`\n🔐 Тестируем вход...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);

  try {
    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, department: true }
    });

    if (!user) {
      console.log('❌ Ошибка: Foydalanuvchi topilmadi');
      console.log('   Пользователь с таким email не найден в базе данных\n');
      
      // Показываем похожие email'ы
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true }
      });
      
      console.log('📋 Доступные пользователи:');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name})`);
      });
      return;
    }

    console.log(`✅ Пользователь найден: ${user.name}`);
    console.log(`   Role: ${user.role.name}`);
    console.log(`   Department: ${user.department.name}\n`);

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Ошибка: Email yoki parol noto\'g\'ri');
      console.log('   Пароль неверный\n');
      return;
    }

    console.log('✅ Пароль верный!');
    console.log('✅ Вход успешен!\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем аргументы из командной строки
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Использование: node test-login.js <email> <password>');
  console.log('\nПримеры:');
  console.log('  node test-login.js admin@agrobank.uz admin_pass_2025');
  console.log('  node test-login.js board@agrobank.uz board_pass_2025');
  console.log('  node test-login.js apparat@agrobank.uz apparat_pass_2025');
  process.exit(1);
}

testLogin(email, password);
