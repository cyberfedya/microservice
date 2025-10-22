// server/prisma/seed.ts
import { PrismaClient, Department } from '@prisma/client'; // Импортируем 'Department'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- 1. ДАННЫЕ ДЛЯ РОЛЕЙ ---
const rolesToCreate = [
  { name: 'Admin', description: 'Super user for system management' },
  { name: 'Bank apparati', description: 'Handles document registration and dispatch' },
  { name: 'Boshqaruv', description: 'Management, assigns executors and signs documents' },
  { name: 'Yordamchi', description: 'Assistant to management, prepares resolutions' },
  { name: 'Tarmoq', description: 'Department head or executor' },
  { name: 'Reviewer', description: 'Employee-level executor/reviewer' },
  { name: 'Resepshn', description: 'Handles citizen requests at reception' },
  { name: 'Bank Kengashi kotibi', description: 'Secretary of the Bank Council' },
  { name: 'Kollegial organ kotibi', description: 'Secretary of the Collegial Body' },
];

// --- 2. ДАННЫЕ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ---
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


// --- 3. ДАННЫЕ ДЛЯ ИЕРАРХИИ ДЕПАРТАМЕНТОВ (из твоего файла) ---
const orgHierarchy = {
  "Bank Aksiyadorlarining umumiy yigiilishi": {
    "Bank Kuzatuv kengashi": {
      "Ichki audit departamenti": {},
      "Audit qo'mitasi": {},
      "Risklarni boshqarish va komplaens nazorat qo'mitasi": {},
      "Korporativ boshqaruv xizmati": {},
      "Tayinlovlar, mukofatlash va korporativ boshqaruv qo'mitasi": {},
      "Strategiya, investitsiyalar va transformatsiyalar qo'mitasi": {},
      "Bank Boshqaruvi": {
        "Investitsiya qo'mitasi": {},
        "Likvidlikni boshqarish qo'mitasi": {},
        "Loyiha boshqaruvi qo'mitasi": {},
        "Kredit qo'mitasi": {},
        "Tarif qo'mitasi": {},
        "Leader Finance Capital MCHJ": {},
        "Qoraqolpog'iston Respublikasi va viloyatlar boshqarmalari": {
          "Toshkent viloyati hududiy boshqarmasi": {
            "Boshqarma boshligi": {
              "Komplaens nazorat guruhi": {},
              "Boshqarma boshlig'i o'rinbosari (1)": {
                "Chakana xizmatlarni rivojlantirish bo'limi": {},
                "Investitsiya faoliyatini muvofiqlashtirish va loyihalarni boshqarish bo'limi": {},
                "Axborot texnologiyalari va muhofazasi sho'basi": {}
              },
              "Boshqarma boshlig'i o'rinbosari (2)": {
                "Mahallabay ishlash bo'limi": {},
                "Hududiy dasturlar monitoringi sho'basi": {},
                "Buxgalteriya hisobi va hisoboti bo'limi": {
                  "Pul muomalasi va kassa ishini tashkil qilish sho'basi": {},
                },
              },
              "Boshqarma boshlig'i o'rinbosari (3)": {
                "Muammoli kreditlar bilan ishlash bo'limi": {}
              },
              "Boshqarma boshlig'i o'rinbosari (4)": {
                "Agrosanoat majmuasi korxonalarini moliyalashtirish bo'limi": {
                  "Imtiyozli kreditlash bo'limi": {},
                  "Tijorat kreditlash sho'basi": {},
                  "Tayyorlov korxonalari va agroklasterlarga xizmat ko'rsatish sho'basi": {}
                },
                "Ijtimoiy loyihalar bo'limi": {},
              },
              "Xodimlar bilan ishlash bo'limi": {},
              "Yuridik bo'lim": {},
              "Hududiy filial": {
                "Toshkent viloyati filial N1": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Toshkent viloyati filial N1 BXMN1": {},
                        "Toshkent viloyati filial N1 BXMN2": {},
                        "Toshkent viloyati filial N1 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
                "Toshkent viloyati filial N2": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Toshkent viloyati filial N2 BXMN1": {},
                        "Toshkent viloyati filial N2 BXMN2": {},
                        "Toshkent viloyati filial N2 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
                "Toshkent viloyati filial N3": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Toshkent viloyati filial N3 BXMN1": {},
                        "Toshkent viloyati filial N3 BXMN2": {},
                        "Toshkent viloyati filial N3 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
              }
            }
          },
          "Samarqand viloyati hududiy boshqarmasi": {
            "Boshqarma boshligi": {
              "Komplaens nazorat guruhi": {},
              "Boshqarma boshlig'i o'rinbosari (1)": {
                "Chakana xizmatlarni rivojlantirish bo'limi": {},
                "Investitsiya faoliyatini muvofiqlashtirish va loyihalarni boshqarish bo'limi": {},
                "Axborot texnologiyalari va muhofazasi sho'basi": {}
              },
              "Boshqarma boshlig'i o'rinbosari (2)": {
                "Mahallabay ishlash bo'limi": {},
                "Hududiy dasturlar monitoringi sho'basi": {},
                "Buxgalteriya hisobi va hisoboti bo'limi": {
                  "Pul muomalasi va kassa ishini tashkil qilish sho'basi": {},
                },
              },
              "Boshqarma boshlig'i o'rinbosari (3)": {
                "Muammoli kreditlar bilan ishlash bo'limi": {}
              },
              "Boshqarma boshlig'i o'rinbosari (4)": {
                "Agrosanoat majmuasi korxonalarini moliyalashtirish bo'limi": {
                  "Imtiyozli kreditlash bo'limi": {},
                  "Tijorat kreditlash sho'basi": {},
                  "Tayyorlov korxonalari va agroklasterlarga xizmat ko'rsatish sho'basi": {}
                },
                "Ijtimoiy loyihalar bo'limi": {},
              },
              "Xodimlar bilan ishlash bo'limi": {},
              "Yuridik bo'lim": {},
              "Hududiy filial": {
                "Samarqand viloyati filial N1": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Samarqand viloyati filial N1 BXMN1": {},
                        "Samarqand viloyati filial N1 BXMN2": {},
                        "Samarqand viloyati filial N1 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
                "Samarqand viloyati filial N2": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Samarqand viloyati filial N2 BXMN1": {},
                        "Samarqand viloyati filial N2 BXMN2": {},
                        "Samarqand viloyati filial N2 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
                "Samarqand viloyati filial N3": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Samarqand viloyati filial N3 BXMN1": {},
                        "Samarqand viloyati filial N3 BXMN2": {},
                        "Samarqand viloyati filial N3 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
              }
            }
          },
          "Andijon viloyati hududiy boshqarmasi": {
            "Boshqarma boshligi": {
              "Komplaens nazorat guruhi": {},
              "Boshqarma boshlig'i o'rinbosari (1)": {
                "Chakana xizmatlarni rivojlantirish bo'limi": {},
                "Investitsiya faoliyatini muvofiqlashtirish va loyihalarni boshqarish bo'limi": {},
                "Axborot texnologiyalari va muhofazasi sho'basi": {}
              },
              "Boshqarma boshlig'i o'rinbosari (2)": {
                "Mahallabay ishlash bo'limi": {},
                "Hududiy dasturlar monitoringi sho'basi": {},
                "Buxgalteriya hisobi va hisoboti bo'limi": {
                  "Pul muomalasi va kassa ishini tashkil qilish sho'basi": {},
                },
              },
              "Boshqarma boshlig'i o'rinbosari (3)": {
                "Muammoli kreditlar bilan ishlash bo'limi": {}
              },
              "Boshqarma boshlig'i o'rinbosari (4)": {
                "Agrosanoat majmuasi korxonalarini moliyalashtirish bo'limi": {
                  "Imtiyozli kreditlash bo'limi": {},
                  "Tijorat kreditlash sho'basi": {},
                  "Tayyorlov korxonalari va agroklasterlarga xizmat ko'rsatish sho'basi": {}
                },
                "Ijtimoiy loyihalar bo'limi": {},
              },
              "Xodimlar bilan ishlash bo'limi": {},
              "Yuridik bo'lim": {},
              "Hududiy filial": {
                "Andijon viloyati filial N1": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Andijon viloyati filial N1 BXMN1": {},
                        "Andijon viloyati filial N1 BXMN2": {},
                        "Andijon viloyati filial N1 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
                "Andijon viloyati filial N2": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Andijon viloyati filial N2 BXMN1": {},
                        "Andijon viloyati filial N2 BXMN2": {},
                        "Andijon viloyati filial N2 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
                "Andijon viloyati filial N3": { "Boshqaruvchi": {
                    "Xodimlar bilan ishlash xizmati": {},
                    "Front-ofis": {
                      "Resepshn": {},
                      "Chakana biznes bo'limi": {},
                      "Korporativ biznes bo'limi": {},
                      "Chakana amaliyotlar kassasi": {},
                      "Bank xizmatlari markazlari": {
                        "Andijon viloyati filial N3 BXMN1": {},
                        "Andijon viloyati filial N3 BXMN2": {},
                        "Andijon viloyati filial N3 BXMN3": {},
                      }
                    },
                    "Qishloq xo'jaligi korxonalariga xizmat ko'rsatish bo'limi": {},
                    "Muammoli kreditlar bilan ishlash bo'limi": {},
                    "Bek-ofis": {
                      "Kreditlarni boshqarish bo'limi": {},
                      "Mahallabay ishlash bo'limi": {},
                      "Buxgalteriya hisobi va hisoboti bo'limi": {},
                      "Kassa bo'limi": {}
                    }
                  } },
              }
            }
          },
          "Toshkent shahar filiali": {
            "Boshqaruvchi": {
              "Komplaens nazorat guruhi": {},
              "Front ofis": {
                "Resepshn": {},
                "Korporativ biznes bo'limi": {},
                "Tashqi savdo amaliyotlari bilan ishlash sho'basi": {},
                "Chakana biznes bo'limi": {},
                "Chakana amaliyotlar kassasi": {},
                "Omonotlar bilan ishlash sho'basi": {},
                "Bank xizmatlari markazlari": {
                  "Toshkent shahar filiali BXMN1": {},
                  "Toshkent shahar filiali BXMN2": {},
                  "Toshkent shahar filiali BXMN3": {},
                }
              },
              "Bek ofis": {
                "Kreditlarni boshqarish bo'limi": {},
                "Kassa bo'limi": {},
                "Mahallabay ishlash bo'limi": {},
                "Buxgalteriya hisobi va hisoboti bo'limi": {
                  "Pul muomalasi va kassa ishini tashkil qilish sho'basi": {},
                },
                "Infratuzilmalar bilan ishlash sho'basi": {},
                "Plastik karta texnikalariga xizmat ko'rsatish sho'basi": {},
              },
              "Muammoli kreditlar bilan ishlash bo'limi": {},
              "Yuridik xizmat": {},
              "Xodimlar bilan ishlash bo'limi": {},
              "Axborot texnologiyalari va muhofazasi sho'basi": {},
              "Ijro nazorati va xatlar bilan ishlash sho'basi": {},
              "Umumiy bo'lim": {},
              "Investitsiya loyihalarini moliyalashtirish va monitoring qilish bo'limi": {}
            }
          },
        },
        "Bosh Ofis": {
          "Boshqaruv Raisi": {
            "Boshqaruv raisining birinchi o'rinbosari v.b.": {
              "Suv va ijtimoiy loyihalar markazi": {},
              "Mahallabay ishlash departamenti": {},
              "Hududiy dasturlar monitoringi boshqarmasi": {},
              "Matbuot xizmati": {}
            },
            "Boshqaruv raisi o'rinbosari v.b. (1)": {
              "Axborot xavfsizligi departamenti": {},
              "Xorijiy hamkorlar bilan ishlash departamenti": {},
              "Korporativ biznes departamenti": {}
            },
            "Boshqaruv raisi o'rinbosari v.b. (2)": {
              "Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti": {}
            },
            "Boshqaruv raisi o'rinbosari v.b. (3)": {
              "Risk menejmenti departamenti": {},
              "Muammoli kreditlar bilan ishlash departamenti": {},
              "Kredit anderraytingi markazi": {},
              "Kreditlarni boshqarish departamenti": {},
              "Komplaens nazorat departamenti": {}
            },
            "Boshqaruv raisi o'rinbosari v.b. (4)": {
              "Moliyaviy blok": {},
              "Bank apparati": {},
              "Sho'ba korxonalar": {},
            },
            "Boshqaruvchi direktor - Boshqaruv raisi o'rinbosari v.b.": {
              "G'aznachilik departamenti": {},
              "Strategiya va transformatsiya majmuasi": {},
              "Biznes va raqamli mahsulotlar majmuasi": {},
            },
            "Yuridik departament": {}
          }
        }
      }
    },
  }
};

/**
 * ИСПРАВЛЕННАЯ Рекурсивная функция для создания департаментов
 * @param node - Текущий узел объекта (департаменты)
 * @param parentId - ID родительского департамента (null для верхнего уровня)
 */
async function seedDepartmentsRecursive(node: Record<string, any>, parentId: number | null) {
  for (const departmentName of Object.keys(node)) {
    
    // --- ИЗМЕНЕНИЕ: Заменяем UPSERT на FIND + CREATE ---
    
    // 1. Вручную ищем департамент
    const existingDept = await prisma.department.findFirst({
      where: {
        name: departmentName,
        parentId: parentId, // findFirst МОЖЕТ обрабатывать 'null' здесь
      }
    });

    let newDepartment: Department; // Указываем тип

    if (existingDept) {
      // Если существует, используем его
      newDepartment = existingDept;
      console.log(`   Found department: ${departmentName} (ParentID: ${parentId})`);
    } else {
      // 2. Если не найден, создаем
      newDepartment = await prisma.department.create({
        data: {
          name: departmentName,
          parentId: parentId,
        }
      });
      console.log(`   Created department: ${departmentName} (ParentID: ${parentId})`);
    }
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---


    // 3. Рекурсивно вызываем функцию для дочерних элементов
    const children = node[departmentName];
    if (children && typeof children === 'object' && Object.keys(children).length > 0) {
      await seedDepartmentsRecursive(children, newDepartment.id);
    }
  }
}


async function main() {
  console.log(`Start seeding ...`);

  // --- 1. Seed Roles ---
  console.log('Seeding roles...');
  for (const roleData of rolesToCreate) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
    console.log(`   Upserted role: ${roleData.name}`);
  }

  // --- 2. Seed Department Hierarchy ---
  console.log('Seeding department hierarchy (recursively)...');
  await seedDepartmentsRecursive(orgHierarchy, null);
  console.log('Department hierarchy seeded.');


  // --- 3. Seed User-Specific Departments (IT, HR, etc.) ---
  console.log('Seeding user-assigned departments (as top-level)...');
  const userDeptNames = [...new Set(usersToCreate.map(u => u.department))];
  const createdUserDepts: Department[] = []; // Массив для хранения созданных/найденных депо-в

  for (const deptName of userDeptNames) {
    // --- ИЗМЕНЕНИЕ: Заменяем UPSERT на FIND + CREATE ---
    const existingDept = await prisma.department.findFirst({
      where: { name: deptName, parentId: null }
    });

    if (existingDept) {
      createdUserDepts.push(existingDept);
      console.log(`   Found user-dept: ${deptName}`);
    } else {
      const newDept = await prisma.department.create({
        data: { name: deptName, parentId: null }
      });
      createdUserDepts.push(newDept);
      console.log(`   Created user-dept: ${deptName}`);
    }
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---
  }
  console.log('User-assigned departments ensured.');


  // --- 4. Seed Users ---
  console.log('Seeding users...');
  // Получаем ID ролей
  const rolesMap = (await prisma.role.findMany()).reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {} as Record<string, number>);

  // ИСПОЛЬЗУЕМ ДЕПАРТАМЕНТЫ, КОТОРЫЕ МЫ ТОЛЬКО ЧТО СОЗДАЛИ/НАШЛИ
  const departmentsMap = createdUserDepts.reduce((acc, dept) => {
    acc[dept.name] = dept.id;
    return acc;
  }, {} as Record<string, number>);


  for (const userData of usersToCreate) {
    const roleId = rolesMap[userData.role];
    const departmentId = departmentsMap[userData.department]; // Ищем ID по строковому имени

    if (!roleId) {
      console.error(`   ERROR: Role "${userData.role}" not found for user ${userData.email}. Skipping.`);
      continue;
    }
    if (!departmentId) {
      console.error(`   ERROR: Top-level Department "${userData.department}" not found for user ${userData.email}. Skipping.`);
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
    console.log(`   Upserted user: ${userData.name} (${userData.email})`);
  }

  // --- 5. Set Managers ---
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
        console.log(`   Set manager for ${user.name} to ${manager.name}`);
      } else if (user && !manager) {
        console.warn(`   Manager with email ${userData.managerEmail} not found for user ${userData.name}.`);
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