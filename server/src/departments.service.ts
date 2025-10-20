// server/src/departments.service.ts
import { prisma } from "./prisma";
import { Department } from '@prisma/client'; // Импортируем тип Department

/**
 * Находит все департаменты, отсортированные по ID.
 * @returns {Promise<Department[]>} Массив объектов департаментов.
 */
export async function findDepartments(): Promise<Department[]> {
  console.log("Fetching all departments..."); // Лог для отладки
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: 'asc' } // Сортируем по ID для предсказуемого порядка
    });
    console.log(`Found ${departments.length} departments.`);
    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw new Error("Failed to fetch departments from database."); // Бросаем ошибку
  }
}

// Убедись, что после этой закрывающей скобки '}' больше ничего нет в файле.