// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client'; // Убираем импорт Prisma и UserRole
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Используем СТРОКОВЫЕ имена ролей, как они будут в базе данных
const rolesToCreate = [
  { name: 'Admin', description: 'Super user for system management' },
  { name: 'Bank apparati', description: 'Handles document registration and dispatch' }, // Проверь точное написание
  { name: 'Boshqaruv', description: 'Management, assigns executors and signs documents' },
  { name: 'Yordamchi', description: 'Assistant to management, prepares resolutions' },
  { name: 'Tarmoq', description: 'Department head or executor' },
  { name: 'Reviewer', description: 'Employee-level executor/reviewer' },
  { name: 'Resepshn', description: 'Handles citizen requests at reception' },
  { name: 'Bank Kengashi kotibi', description: 'Secretary of the Bank Council' }, // Проверь точное написание
  { name: 'Kollegial organ kotibi', description: 'Secretary of the Collegial Body' }, // Проверь точное написание
];

const departmentsToCreate = [
  // Top Level / Bosh Ofis
  { name: 'Boshqaruv' },
  { name: 'Ichki audit departamenti' },
  { name: 'Korporativ boshqaruv xizmati' },
  { name: 'IT' },
  { name: 'Bosh apparat' },
  { name: 'Suv va ijtimoiy loyihalar markazi' },
  { name: 'Mahallabay ishlash departamenti' },
  { name: 'Hududiy dasturlar monitoringi boshqarmasi'},
  { name: 'Matbuot xizmati'},
  { name: 'Axborot xavfsizligi departamenti'},
  { name: 'Xorijiy hamkorlar bilan ishlash departamenti'},
  { name: 'Korporativ biznes departamenti'},
  { name: 'Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti'},
  { name: 'Risk menejmenti departamenti'},
  { name: 'Muammoli kreditlar bilan ishlash departamenti'},
  { name: 'Kredit anderraytingi markazi'},
  { name: 'Kreditlarni boshqarish departamenti'},
  { name: 'Komplaens nazorat departamenti'},
  { name: 'Moliyaviy blok'},
  { name: 'G\'aznachilik departamenti' },
  { name: 'Strategiya va transformatsiya majmuasi' },
  { name: 'Biznes va raqamli mahsulotlar majmuasi' },
  { name: 'Yuridik departament' },
  { name: 'HR' },
  // Hududiy Boshqarmalar
  { name: 'Toshkent viloyati hududiy boshqarmasi' },
  { name: 'Samarqand viloyati hududiy boshqarmasi' },
  { name: 'Andijon viloyati hududiy boshqarmasi' },
  // Filiallar
  { name: 'Toshkent shahar filiali' },
  // Добавь остальные департаменты по необходимости
];

// Используем СТРОКОВЫЕ имена ролей
const usersToCreate = [
  { name: 'Azizov A. (Admin)', email: 'admin@agrobank.uz', role: 'Admin', department: 'IT', password: 'admin_pass_2025' },
  { name: 'Karimov K. (Apparat)', email: 'apparat@agrobank.uz', role: 'Bank apparati', department: 'Bosh apparat', password: 'apparat_pass_2025' },
  { name: 'Valiyev V. (Boshqaruv)', email: 'board@agrobank.uz', role: 'Boshqaruv', department: 'Boshqaruv', password: 'board_pass_2025' },
  { name: 'Nazarov N. (Yordamchi)', email: 'assistant@agrobank.uz', role: 'Yordamchi', department: 'Boshqaruv', password: 'assistant_pass_2025', managerEmail: 'board@agrobank.uz' },
  { name: 'Tursunov T. (Kreditlash)', email: 'credit.head@agrobank.uz', role: 'Tarmoq', department: 'Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti', password: 'credit_head_pass_2025' },
  { name: 'Murodov M. (Ijrochi)', email: 'credit.reviewer@agrobank.uz', role: 'Reviewer', department: 'Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti', password: 'reviewer_pass_2025', managerEmail: 'credit.head@agrobank.uz' },
  { name: 'Saidov S. (HR)', email: 'hr.head@agrobank.uz', role: 'Tarmoq', department: 'HR', password: 'hr_pass_2025' },
  { name: 'Usmonova U. (Yuridik)', email: 'legal.head@agrobank.uz', role: 'Tarmoq', department: 'Yuridik departament', password: 'legal_pass_2025' },
  { name: 'Qosimov Q. (Komplayens)', email: 'compliance.head@agrobank.uz', role: 'Tarmoq', department: 'Komplaens nazorat departamenti', password: 'compliance_pass_2025' },
  { name: 'Jorayev J. (Resepshn)', email: 'reception@agrobank.uz', role: 'Resepshn', department: 'Bosh apparat', password: 'reception_pass_2025' },
  { name: 'Sultanova S. (Kengash Kotibi)', email: 'council.secretary@agrobank.uz', role: 'Bank Kengashi kotibi', department: 'Boshqaruv', password: 'council_pass_2025' },
  { name: 'Rahmatov R. (Kollegial Kotib)', email: 'collegial.secretary@agrobank.uz', role: 'Kollegial organ kotibi', department: 'Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti', password: 'collegial_pass_2025' },
];


async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Roles ---
  console.log('Seeding roles...');
  for (const roleData of rolesToCreate) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
    console.log(`  Upserted role: ${roleData.name}`);
  }

  // --- Seed Departments ---
  console.log('Seeding departments...');
  for (const deptData of departmentsToCreate) {
     await prisma.department.upsert({
       where: { name: deptData.name },
       update: {}, // Нет полей для обновления
       create: deptData,
     });
    console.log(`  Upserted department: ${deptData.name}`);
  }

  // --- Seed Users ---
  console.log('Seeding users...');
  // Получаем ID ролей и департаментов после их создания/обновления
  const rolesMap = (await prisma.role.findMany()).reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {} as Record<string, number>);

  const departmentsMap = (await prisma.department.findMany()).reduce((acc, dept) => {
    acc[dept.name] = dept.id;
    return acc;
  }, {} as Record<string, number>);

  for (const userData of usersToCreate) {
    const roleId = rolesMap[userData.role]; // Ищем ID по строковому имени
    const departmentId = departmentsMap[userData.department]; // Ищем ID по строковому имени

    if (!roleId) {
      console.error(`  ERROR: Role "${userData.role}" not found in database for user ${userData.email}. Check rolesToCreate array spelling. Skipping user.`);
      continue;
    }
     if (!departmentId) {
      console.error(`  ERROR: Department "${userData.department}" not found in database for user ${userData.email}. Check departmentsToCreate array spelling. Skipping user.`);
      continue;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(userData.password, salt);

     await prisma.user.upsert({
       where: { email: userData.email },
       update: {
           name: userData.name,
           roleId: roleId,
           departmentId: departmentId,
       },
       create: {
         name: userData.name,
         email: userData.email,
         password: hash,
         roleId: roleId,
         departmentId: departmentId,
       },
     });
    console.log(`  Upserted user: ${userData.name} (${userData.email})`);
  }

   // --- Set Managers ---
   console.log('Setting managers...');
   for (const userData of usersToCreate) {
       if (userData.managerEmail) {
           const user = await prisma.user.findUnique({ where: { email: userData.email } });
           const manager = await prisma.user.findUnique({ where: { email: userData.managerEmail } });

           if (user && manager && user.managerId !== manager.id) {
               await prisma.user.update({
                   where: { id: user.id },
                   data: { managerId: manager.id },
               });
               console.log(`  Set manager for ${user.name} to ${manager.name}`);
           } else if (user && !manager) {
                console.warn(`  Manager with email ${userData.managerEmail} not found for user ${userData.name}.`);
           }
       }
   }


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });