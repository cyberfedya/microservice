// server/src/users.service.ts
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { User } from '@prisma/client'; // Импортируем тип User из Prisma

// Вспомогательная функция для форматирования пользователя для ответа API
// Убираем пароль и возвращаем имена роли и департамента
const formatUserForApi = (user: User & { role: { name: string }, department: { name: string } }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, roleId, departmentId, ...rest } = user;
  return {
    ...rest,
    role: user.role.name,
    department: user.department.name,
  };
};

export async function findUsers() {
  const users = await prisma.user.findMany({
    include: { role: true, department: true },
    orderBy: { id: 'asc' },
  });
  // Форматируем каждого пользователя перед отправкой
  return users.map(formatUserForApi);
}

// Типизируем data для создания пользователя
interface CreateUserData {
  name: string;
  email: string;
  password?: string; // Пароль обязателен только при создании
  role: string; // Имя роли
  department: string; // Имя департамента
}

export async function createUser(data: CreateUserData) {
  const { name, email, password, role, department } = data;

  if (!password) {
    throw new Error("Password is required for new users");
  }

  const roleRecord = await prisma.role.findUnique({ where: { name: role } });
  const departmentRecord = await prisma.department.findUnique({ where: { name: department } });

  if (!roleRecord) throw new Error(`Role with name "${role}" not found.`);
  if (!departmentRecord) throw new Error(`Department with name "${department}" not found.`);

  // Проверка на существующего пользователя
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error(`User with email "${email}" already exists.`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: roleRecord.id,
      departmentId: departmentRecord.id,
    },
    include: { role: true, department: true }, // Включаем связанные данные
  });
  return formatUserForApi(newUser); // Форматируем перед возвратом
}

// Типизируем data для обновления пользователя
interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
    password?: string; // Пароль необязателен при обновлении
}

export async function updateUser(id: number, data: UpdateUserData) {
  const { name, email, password, role, department } = data;

  const updateData: any = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;

  // Если передан пароль, хешируем его
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // Если передана роль, находим ее ID
  if (role) {
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) throw new Error(`Role with name "${role}" not found.`);
    updateData.roleId = roleRecord.id;
  }

  // Если передан департамент, находим его ID
  if (department) {
    const departmentRecord = await prisma.department.findUnique({ where: { name: department } });
    if (!departmentRecord) throw new Error(`Department with name "${department}" not found.`);
    updateData.departmentId = departmentRecord.id;
  }

  // Проверяем, есть ли что обновлять
  if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields provided for update.");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { role: true, department: true }, // Включаем связанные данные
  });
  return formatUserForApi(updatedUser); // Форматируем перед возвратом
}

export async function deleteUser(id: number) {
  // Добавим проверку на удаление самого себя или админа (если нужно)
  // const userToDelete = await prisma.user.findUnique({ where: { id }, include: { role: true }});
  // if (userToDelete?.role.name === 'Admin') {
  //   throw new Error("Cannot delete Admin user.");
  // }

  // Проверка связанных записей (например, документы) перед удалением
  const relatedDocsCount = await prisma.document.count({
      where: {
          OR: [
              { authorId: id },
              { mainExecutorId: id },
              { internalAssigneeId: id }
          ]
      }
  });

  if (relatedDocsCount > 0) {
      throw new Error("Cannot delete user. User is associated with existing documents. Reassign documents first.");
  }
  // Добавить похожие проверки для других связей, если нужно

  return prisma.user.delete({
       where: { id }
  });
}