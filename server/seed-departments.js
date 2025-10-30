// Скрипт для добавления полной иерархии департаментов
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDepartments() {
  console.log('🌱 Начинаем добавление департаментов...');

  try {
    // Уровень 1: Корневой департамент
    const root = await prisma.department.create({
      data: { name: 'Bank Aksiyadorlarining umumiy yigiilishi' }
    });
    console.log('✅ Создан корневой департамент');

    // Уровень 2: Bank Kuzatuv kengashi
    const kuzatuv = await prisma.department.create({
      data: { name: 'Bank Kuzatuv kengashi', parentId: root.id }
    });

    // Уровень 3: Подразделения Bank Kuzatuv kengashi
    await prisma.department.createMany({
      data: [
        { name: 'Ichki audit departamenti', parentId: kuzatuv.id },
        { name: 'Audit qo\'mitasi', parentId: kuzatuv.id },
        { name: 'Risklarni boshqarish va komplaens nazorat qo\'mitasi', parentId: kuzatuv.id },
        { name: 'Korporativ boshqaruv xizmati', parentId: kuzatuv.id },
        { name: 'Tayinlovlar, mukofatlash va korporativ boshqaruv qo\'mitasi', parentId: kuzatuv.id },
        { name: 'Strategiya, investitsiyalar va transformatsiyalar qo\'mitasi', parentId: kuzatuv.id },
      ]
    });
    console.log('✅ Созданы подразделения Bank Kuzatuv kengashi');

    const boshqaruvi = await prisma.department.create({
      data: { name: 'Bank Boshqaruvi', parentId: kuzatuv.id }
    });

    // Уровень 4: Подразделения Bank Boshqaruvi
    await prisma.department.createMany({
      data: [
        { name: 'Investitsiya qo\'mitasi', parentId: boshqaruvi.id },
        { name: 'Likvidlikni boshqarish qo\'mitasi', parentId: boshqaruvi.id },
        { name: 'Loyiha boshqaruvi qo\'mitasi', parentId: boshqaruvi.id },
        { name: 'Kredit qo\'mitasi', parentId: boshqaruvi.id },
        { name: 'Tarif qo\'mitasi', parentId: boshqaruvi.id },
        { name: 'Leader Finance Capital MCHJ', parentId: boshqaruvi.id },
      ]
    });

    const viloyatlar = await prisma.department.create({
      data: { name: 'Qoraqolpog\'iston Respublikasi va viloyatlar boshqarmalari', parentId: boshqaruvi.id }
    });

    const boshOfis = await prisma.department.create({
      data: { name: 'Bosh Ofis', parentId: boshqaruvi.id }
    });
    console.log('✅ Созданы основные подразделения');

    // Региональные управления - Toshkent viloyati
    const toshkentViloyat = await prisma.department.create({
      data: { name: 'Toshkent viloyati hududiy boshqarmasi', parentId: viloyatlar.id }
    });

    const toshkentBoshliq = await prisma.department.create({
      data: { name: 'Boshqarma boshligi (Toshkent)', parentId: toshkentViloyat.id }
    });

    await prisma.department.createMany({
      data: [
        { name: 'Komplaens nazorat guruhi (Toshkent)', parentId: toshkentBoshliq.id },
        { name: 'Xodimlar bilan ishlash bo\'limi (Toshkent)', parentId: toshkentBoshliq.id },
        { name: 'Yuridik bo\'lim (Toshkent)', parentId: toshkentBoshliq.id },
      ]
    });

    // Заместители Toshkent
    const orinbosar1T = await prisma.department.create({
      data: { name: 'Boshqarma boshlig\'i o\'rinbosari (1) Toshkent', parentId: toshkentBoshliq.id }
    });
    const orinbosar2T = await prisma.department.create({
      data: { name: 'Boshqarma boshlig\'i o\'rinbosari (2) Toshkent', parentId: toshkentBoshliq.id }
    });
    const orinbosar3T = await prisma.department.create({
      data: { name: 'Boshqarma boshlig\'i o\'rinbosari (3) Toshkent', parentId: toshkentBoshliq.id }
    });
    const orinbosar4T = await prisma.department.create({
      data: { name: 'Boshqarma boshlig\'i o\'rinbosari (4) Toshkent', parentId: toshkentBoshliq.id }
    });

    await prisma.department.createMany({
      data: [
        { name: 'Chakana xizmatlarni rivojlantirish bo\'limi (Toshkent)', parentId: orinbosar1T.id },
        { name: 'Investitsiya faoliyatini muvofiqlashtirish va loyihalarni boshqarish bo\'limi (Toshkent)', parentId: orinbosar1T.id },
        { name: 'Axborot texnologiyalari va muhofazasi sho\'basi (Toshkent)', parentId: orinbosar1T.id },
        { name: 'Mahallabay ishlash bo\'limi (Toshkent)', parentId: orinbosar2T.id },
        { name: 'Hududiy dasturlar monitoringi sho\'basi (Toshkent)', parentId: orinbosar2T.id },
        { name: 'Muammoli kreditlar bilan ishlash bo\'limi (Toshkent o\'rinbosar 3)', parentId: orinbosar3T.id },
        { name: 'Ijtimoiy loyihalar bo\'limi (Toshkent)', parentId: orinbosar4T.id },
      ]
    });

    const buxgalteriyaT = await prisma.department.create({
      data: { name: 'Buxgalteriya hisobi va hisoboti bo\'limi (Toshkent)', parentId: orinbosar2T.id }
    });
    await prisma.department.create({
      data: { name: 'Pul muomalasi va kassa ishini tashkil qilish sho\'basi (Toshkent)', parentId: buxgalteriyaT.id }
    });

    const agroT = await prisma.department.create({
      data: { name: 'Agrosanoat majmuasi korxonalarini moliyalashtirish bo\'limi (Toshkent)', parentId: orinbosar4T.id }
    });
    await prisma.department.createMany({
      data: [
        { name: 'Imtiyozli kreditlash bo\'limi (Toshkent)', parentId: agroT.id },
        { name: 'Tijorat kreditlash sho\'basi (Toshkent)', parentId: agroT.id },
        { name: 'Tayyorlov korxonalari va agroklasterlarga xizmat ko\'rsatish sho\'basi (Toshkent)', parentId: agroT.id },
      ]
    });

    // Филиалы Toshkent
    const hududiyFilialT = await prisma.department.create({
      data: { name: 'Hududiy filial (Toshkent)', parentId: toshkentBoshliq.id }
    });

    const filialN1T = await prisma.department.create({
      data: { name: 'Toshkent viloyati filial N1', parentId: hududiyFilialT.id }
    });
    const boshqaruvchiN1T = await prisma.department.create({
      data: { name: 'Boshqaruvchi (Filial N1 Toshkent)', parentId: filialN1T.id }
    });

    await prisma.department.createMany({
      data: [
        { name: 'Xodimlar bilan ishlash xizmati (Filial N1 Toshkent)', parentId: boshqaruvchiN1T.id },
        { name: 'Qishloq xo\'jaligi korxonalariga xizmat ko\'rsatish bo\'limi (Filial N1 Toshkent)', parentId: boshqaruvchiN1T.id },
        { name: 'Muammoli kreditlar bilan ishlash bo\'limi (Filial N1 Toshkent)', parentId: boshqaruvchiN1T.id },
      ]
    });

    const frontOfisN1T = await prisma.department.create({
      data: { name: 'Front-ofis (Filial N1 Toshkent)', parentId: boshqaruvchiN1T.id }
    });
    const bekOfisN1T = await prisma.department.create({
      data: { name: 'Bek-ofis (Filial N1 Toshkent)', parentId: boshqaruvchiN1T.id }
    });

    await prisma.department.createMany({
      data: [
        { name: 'Resepshn (Filial N1 Toshkent)', parentId: frontOfisN1T.id },
        { name: 'Chakana biznes bo\'limi (Filial N1 Toshkent)', parentId: frontOfisN1T.id },
        { name: 'Korporativ biznes bo\'limi (Filial N1 Toshkent)', parentId: frontOfisN1T.id },
        { name: 'Chakana amaliyotlar kassasi (Filial N1 Toshkent)', parentId: frontOfisN1T.id },
      ]
    });

    const bxmN1T = await prisma.department.create({
      data: { name: 'Bank xizmatlari markazlari (Filial N1 Toshkent)', parentId: frontOfisN1T.id }
    });
    await prisma.department.createMany({
      data: [
        { name: 'Toshkent viloyati filial N1 BXMN1', parentId: bxmN1T.id },
        { name: 'Toshkent viloyati filial N1 BXMN2', parentId: bxmN1T.id },
        { name: 'Toshkent viloyati filial N1 BXMN3', parentId: bxmN1T.id },
      ]
    });

    await prisma.department.createMany({
      data: [
        { name: 'Kreditlarni boshqarish bo\'limi (Bek-ofis Filial N1 Toshkent)', parentId: bekOfisN1T.id },
        { name: 'Mahallabay ishlash bo\'limi (Bek-ofis Filial N1 Toshkent)', parentId: bekOfisN1T.id },
        { name: 'Buxgalteriya hisobi va hisoboti bo\'limi (Bek-ofis Filial N1 Toshkent)', parentId: bekOfisN1T.id },
        { name: 'Kassa bo\'limi (Bek-ofis Filial N1 Toshkent)', parentId: bekOfisN1T.id },
      ]
    });

    // Филиалы N2 и N3 (упрощенно)
    await prisma.department.createMany({
      data: [
        { name: 'Toshkent viloyati filial N2', parentId: hududiyFilialT.id },
        { name: 'Toshkent viloyati filial N3', parentId: hududiyFilialT.id },
      ]
    });

    console.log('✅ Созданы филиалы Toshkent viloyati');

    // Samarqand viloyati
    await prisma.department.create({
      data: { name: 'Samarqand viloyati hududiy boshqarmasi', parentId: viloyatlar.id }
    });

    // Andijon viloyati
    await prisma.department.create({
      data: { name: 'Andijon viloyati hududiy boshqarmasi', parentId: viloyatlar.id }
    });

    // Toshkent shahar filiali
    const toshkentShahar = await prisma.department.create({
      data: { name: 'Toshkent shahar filiali', parentId: viloyatlar.id }
    });
    const boshqaruvchiTS = await prisma.department.create({
      data: { name: 'Boshqaruvchi (Toshkent shahar)', parentId: toshkentShahar.id }
    });

    await prisma.department.createMany({
      data: [
        { name: 'Komplaens nazorat guruhi (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Muammoli kreditlar bilan ishlash bo\'limi (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Yuridik xizmat (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Xodimlar bilan ishlash bo\'limi (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Axborot texnologiyalari va muhofazasi sho\'basi (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Ijro nazorati va xatlar bilan ishlash sho\'basi (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Umumiy bo\'lim (Toshkent shahar)', parentId: boshqaruvchiTS.id },
        { name: 'Investitsiya loyihalarini moliyalashtirish va monitoring qilish bo\'limi (Toshkent shahar)', parentId: boshqaruvchiTS.id },
      ]
    });

    const frontOfisTS = await prisma.department.create({
      data: { name: 'Front ofis (Toshkent shahar)', parentId: boshqaruvchiTS.id }
    });
    const bekOfisTS = await prisma.department.create({
      data: { name: 'Bek ofis (Toshkent shahar)', parentId: boshqaruvchiTS.id }
    });

    await prisma.department.createMany({
      data: [
        { name: 'Resepshn (Toshkent shahar)', parentId: frontOfisTS.id },
        { name: 'Korporativ biznes bo\'limi (Toshkent shahar)', parentId: frontOfisTS.id },
        { name: 'Tashqi savdo amaliyotlari bilan ishlash sho\'basi', parentId: frontOfisTS.id },
        { name: 'Chakana biznes bo\'limi (Toshkent shahar)', parentId: frontOfisTS.id },
        { name: 'Chakana amaliyotlar kassasi (Toshkent shahar)', parentId: frontOfisTS.id },
        { name: 'Omonotlar bilan ishlash sho\'basi', parentId: frontOfisTS.id },
      ]
    });

    const bxmTS = await prisma.department.create({
      data: { name: 'Bank xizmatlari markazlari (Toshkent shahar)', parentId: frontOfisTS.id }
    });
    await prisma.department.createMany({
      data: [
        { name: 'Toshkent shahar filiali BXMN1', parentId: bxmTS.id },
        { name: 'Toshkent shahar filiali BXMN2', parentId: bxmTS.id },
        { name: 'Toshkent shahar filiali BXMN3', parentId: bxmTS.id },
      ]
    });

    await prisma.department.createMany({
      data: [
        { name: 'Kreditlarni boshqarish bo\'limi (Toshkent shahar)', parentId: bekOfisTS.id },
        { name: 'Kassa bo\'limi (Toshkent shahar)', parentId: bekOfisTS.id },
        { name: 'Mahallabay ishlash bo\'limi (Toshkent shahar)', parentId: bekOfisTS.id },
        { name: 'Infratuzilmalar bilan ishlash sho\'basi', parentId: bekOfisTS.id },
        { name: 'Plastik karta texnikalariga xizmat ko\'rsatish sho\'basi', parentId: bekOfisTS.id },
      ]
    });

    const buxgalteriyaTS = await prisma.department.create({
      data: { name: 'Buxgalteriya hisobi va hisoboti bo\'limi (Toshkent shahar)', parentId: bekOfisTS.id }
    });
    await prisma.department.create({
      data: { name: 'Pul muomalasi va kassa ishini tashkil qilish sho\'basi (Toshkent shahar)', parentId: buxgalteriyaTS.id }
    });

    console.log('✅ Созданы региональные управления');

    // Bosh Ofis
    const boshqaruvRaisi = await prisma.department.create({
      data: { name: 'Boshqaruv Raisi', parentId: boshOfis.id }
    });

    const orinbosar1BO = await prisma.department.create({
      data: { name: 'Boshqaruv raisining birinchi o\'rinbosari v.b.', parentId: boshqaruvRaisi.id }
    });
    const orinbosar2BO = await prisma.department.create({
      data: { name: 'Boshqaruv raisi o\'rinbosari v.b. (1)', parentId: boshqaruvRaisi.id }
    });
    const orinbosar3BO = await prisma.department.create({
      data: { name: 'Boshqaruv raisi o\'rinbosari v.b. (2)', parentId: boshqaruvRaisi.id }
    });
    const orinbosar4BO = await prisma.department.create({
      data: { name: 'Boshqaruv raisi o\'rinbosari v.b. (3)', parentId: boshqaruvRaisi.id }
    });
    const orinbosar5BO = await prisma.department.create({
      data: { name: 'Boshqaruv raisi o\'rinbosari v.b. (4)', parentId: boshqaruvRaisi.id }
    });
    const boshqaruvchiDirektor = await prisma.department.create({
      data: { name: 'Boshqaruvchi direktor - Boshqaruv raisi o\'rinbosari v.b.', parentId: boshqaruvRaisi.id }
    });

    await prisma.department.create({
      data: { name: 'Yuridik departament (Bosh Ofis)', parentId: boshqaruvRaisi.id }
    });

    // Подразделения первого заместителя
    await prisma.department.createMany({
      data: [
        { name: 'Suv va ijtimoiy loyihalar markazi', parentId: orinbosar1BO.id },
        { name: 'Mahallabay ishlash departamenti', parentId: orinbosar1BO.id },
        { name: 'Hududiy dasturlar monitoringi boshqarmasi', parentId: orinbosar1BO.id },
        { name: 'Matbuot xizmati', parentId: orinbosar1BO.id },
      ]
    });

    // Подразделения заместителя 1
    await prisma.department.createMany({
      data: [
        { name: 'Axborot xavfsizligi departamenti', parentId: orinbosar2BO.id },
        { name: 'Xorijiy hamkorlar bilan ishlash departamenti', parentId: orinbosar2BO.id },
        { name: 'Korporativ biznes departamenti', parentId: orinbosar2BO.id },
      ]
    });

    // Подразделения заместителя 2
    await prisma.department.create({
      data: { name: 'Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti', parentId: orinbosar3BO.id }
    });

    // Подразделения заместителя 3
    await prisma.department.createMany({
      data: [
        { name: 'Risk menejmenti departamenti', parentId: orinbosar4BO.id },
        { name: 'Muammoli kreditlar bilan ishlash departamenti', parentId: orinbosar4BO.id },
        { name: 'Kredit anderraytingi markazi', parentId: orinbosar4BO.id },
        { name: 'Kreditlarni boshqarish departamenti', parentId: orinbosar4BO.id },
        { name: 'Komplaens nazorat departamenti', parentId: orinbosar4BO.id },
      ]
    });

    // Подразделения заместителя 4
    await prisma.department.createMany({
      data: [
        { name: 'Moliyaviy blok', parentId: orinbosar5BO.id },
        { name: 'Bank apparati', parentId: orinbosar5BO.id },
        { name: 'Sho\'ba korxonalar', parentId: orinbosar5BO.id },
      ]
    });

    // Подразделения управляющего директора
    await prisma.department.createMany({
      data: [
        { name: 'G\'aznachilik departamenti', parentId: boshqaruvchiDirektor.id },
        { name: 'Strategiya va transformatsiya majmuasi', parentId: boshqaruvchiDirektor.id },
        { name: 'Biznes va raqamli mahsulotlar majmuasi', parentId: boshqaruvchiDirektor.id },
      ]
    });

    console.log('✅ Создан Bosh Ofis со всеми подразделениями');

    const count = await prisma.department.count();
    console.log(`\n🎉 Успешно добавлено ${count} департаментов!`);

  } catch (error) {
    console.error('❌ Ошибка при добавлении департаментов:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDepartments()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
