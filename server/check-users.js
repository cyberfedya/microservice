// Скрипт для проверки пользователей в базе данных
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Проверяем пользователей в базе данных...\n');

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        department: true
      }
    });

    if (users.length === 0) {
      console.log('❌ Пользователи не найдены в базе данных!');
      console.log('Запустите: npm run seed');
      return;
    }

    console.log(`✅ Найдено пользователей: ${users.length}\n`);
    console.log('=' .repeat(80));

    for (const user of users) {
      console.log(`\n👤 ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role.name}`);
      console.log(`   Department: ${user.department.name}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      
      // Проверяем пароли из seed файла
      const testPasswords = [
        'admin_pass_2025',
        'apparat_pass_2025',
        'board_pass_2025',
        'assistant_pass_2025',
        'credit_head_pass_2025',
        'reviewer_pass_2025',
        'hr_pass_2025',
        'legal_pass_2025',
        'compliance_pass_2025',
        'reception_pass_2025',
        'council_pass_2025',
        'collegial_pass_2025'
      ];

      for (const testPass of testPasswords) {
        const isMatch = await bcrypt.compare(testPass, user.password);
        if (isMatch) {
          console.log(`   ✅ Пароль: ${testPass}`);
          break;
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Список для входа:');
    console.log('=' .repeat(80));
    
    const credentials = [
      { email: 'admin@agrobank.uz', password: 'admin_pass_2025', role: 'Admin' },
      { email: 'apparat@agrobank.uz', password: 'apparat_pass_2025', role: 'Bank apparati' },
      { email: 'board@agrobank.uz', password: 'board_pass_2025', role: 'Boshqaruv' },
      { email: 'assistant@agrobank.uz', password: 'assistant_pass_2025', role: 'Yordamchi' },
      { email: 'credit.head@agrobank.uz', password: 'credit_head_pass_2025', role: 'Tarmoq' },
      { email: 'credit.reviewer@agrobank.uz', password: 'reviewer_pass_2025', role: 'Reviewer' },
      { email: 'hr.head@agrobank.uz', password: 'hr_pass_2025', role: 'Tarmoq' },
      { email: 'legal.head@agrobank.uz', password: 'legal_pass_2025', role: 'Tarmoq' },
      { email: 'compliance.head@agrobank.uz', password: 'compliance_pass_2025', role: 'Tarmoq' },
      { email: 'reception@agrobank.uz', password: 'reception_pass_2025', role: 'Resepshn' },
      { email: 'council.secretary@agrobank.uz', password: 'council_pass_2025', role: 'Bank Kengashi kotibi' },
      { email: 'collegial.secretary@agrobank.uz', password: 'collegial_pass_2025', role: 'Kollegial organ kotibi' },
    ];

    for (const cred of credentials) {
      const userExists = users.find(u => u.email === cred.email);
      if (userExists) {
        console.log(`\n✅ ${cred.role}`);
        console.log(`   Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}`);
      } else {
        console.log(`\n❌ ${cred.role} - НЕ НАЙДЕН`);
        console.log(`   Email: ${cred.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
