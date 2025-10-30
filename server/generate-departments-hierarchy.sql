-- Полная иерархия департаментов банка
-- Сначала удаляем старые департаменты (осторожно!)
-- DELETE FROM "Department" WHERE id > 7;

-- Уровень 1: Корневой департамент
INSERT INTO "Department" (name, "parentId") VALUES 
('Bank Aksiyadorlarining umumiy yigiilishi', NULL);

-- Уровень 2: Bank Kuzatuv kengashi
INSERT INTO "Department" (name, "parentId") VALUES 
('Bank Kuzatuv kengashi', (SELECT id FROM "Department" WHERE name = 'Bank Aksiyadorlarining umumiy yigiilishi'));

-- Уровень 3: Подразделения Bank Kuzatuv kengashi
INSERT INTO "Department" (name, "parentId") VALUES 
('Ichki audit departamenti', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi')),
('Audit qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi')),
('Risklarni boshqarish va komplaens nazorat qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi')),
('Korporativ boshqaruv xizmati', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi')),
('Tayinlovlar, mukofatlash va korporativ boshqaruv qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi')),
('Strategiya, investitsiyalar va transformatsiyalar qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi')),
('Bank Boshqaruvi', (SELECT id FROM "Department" WHERE name = 'Bank Kuzatuv kengashi'));

-- Уровень 4: Подразделения Bank Boshqaruvi
INSERT INTO "Department" (name, "parentId") VALUES 
('Investitsiya qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Likvidlikni boshqarish qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Loyiha boshqaruvi qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Kredit qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Tarif qo''mitasi', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Leader Finance Capital MCHJ', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Qoraqolpog''iston Respublikasi va viloyatlar boshqarmalari', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi')),
('Bosh Ofis', (SELECT id FROM "Department" WHERE name = 'Bank Boshqaruvi'));

-- Региональные управления
-- Toshkent viloyati
INSERT INTO "Department" (name, "parentId") VALUES 
('Toshkent viloyati hududiy boshqarmasi', (SELECT id FROM "Department" WHERE name = 'Qoraqolpog''iston Respublikasi va viloyatlar boshqarmalari')),
('Boshqarma boshligi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Toshkent viloyati hududiy boshqarmasi'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Komplaens nazorat guruhi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Boshqarma boshlig''i o''rinbosari (1) Toshkent', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Boshqarma boshlig''i o''rinbosari (2) Toshkent', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Boshqarma boshlig''i o''rinbosari (3) Toshkent', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Boshqarma boshlig''i o''rinbosari (4) Toshkent', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Xodimlar bilan ishlash bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Yuridik bo''lim (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)')),
('Hududiy filial (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshligi (Toshkent)'));

-- Подразделения заместителей (Toshkent)
INSERT INTO "Department" (name, "parentId") VALUES 
('Chakana xizmatlarni rivojlantirish bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (1) Toshkent')),
('Investitsiya faoliyatini muvofiqlashtirish va loyihalarni boshqarish bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (1) Toshkent')),
('Axborot texnologiyalari va muhofazasi sho''basi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (1) Toshkent'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Mahallabay ishlash bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (2) Toshkent')),
('Hududiy dasturlar monitoringi sho''basi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (2) Toshkent')),
('Buxgalteriya hisobi va hisoboti bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (2) Toshkent'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Pul muomalasi va kassa ishini tashkil qilish sho''basi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Buxgalteriya hisobi va hisoboti bo''limi (Toshkent)'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Muammoli kreditlar bilan ishlash bo''limi (Toshkent o''rinbosar 3)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (3) Toshkent'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Agrosanoat majmuasi korxonalarini moliyalashtirish bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (4) Toshkent')),
('Ijtimoiy loyihalar bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqarma boshlig''i o''rinbosari (4) Toshkent'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Imtiyozli kreditlash bo''limi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Agrosanoat majmuasi korxonalarini moliyalashtirish bo''limi (Toshkent)')),
('Tijorat kreditlash sho''basi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Agrosanoat majmuasi korxonalarini moliyalashtirish bo''limi (Toshkent)')),
('Tayyorlov korxonalari va agroklasterlarga xizmat ko''rsatish sho''basi (Toshkent)', (SELECT id FROM "Department" WHERE name = 'Agrosanoat majmuasi korxonalarini moliyalashtirish bo''limi (Toshkent)'));

-- Филиалы Toshkent viloyati
INSERT INTO "Department" (name, "parentId") VALUES 
('Toshkent viloyati filial N1', (SELECT id FROM "Department" WHERE name = 'Hududiy filial (Toshkent)')),
('Toshkent viloyati filial N2', (SELECT id FROM "Department" WHERE name = 'Hududiy filial (Toshkent)')),
('Toshkent viloyati filial N3', (SELECT id FROM "Department" WHERE name = 'Hududiy filial (Toshkent)'));

-- Структура филиала N1
INSERT INTO "Department" (name, "parentId") VALUES 
('Boshqaruvchi (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Toshkent viloyati filial N1'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Xodimlar bilan ishlash xizmati (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Filial N1 Toshkent)')),
('Front-ofis (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Filial N1 Toshkent)')),
('Qishloq xo''jaligi korxonalariga xizmat ko''rsatish bo''limi (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Filial N1 Toshkent)')),
('Muammoli kreditlar bilan ishlash bo''limi (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Filial N1 Toshkent)')),
('Bek-ofis (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Filial N1 Toshkent)'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Resepshn (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Front-ofis (Filial N1 Toshkent)')),
('Chakana biznes bo''limi (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Front-ofis (Filial N1 Toshkent)')),
('Korporativ biznes bo''limi (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Front-ofis (Filial N1 Toshkent)')),
('Chakana amaliyotlar kassasi (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Front-ofis (Filial N1 Toshkent)')),
('Bank xizmatlari markazlari (Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Front-ofis (Filial N1 Toshkent)'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Toshkent viloyati filial N1 BXMN1', (SELECT id FROM "Department" WHERE name = 'Bank xizmatlari markazlari (Filial N1 Toshkent)')),
('Toshkent viloyati filial N1 BXMN2', (SELECT id FROM "Department" WHERE name = 'Bank xizmatlari markazlari (Filial N1 Toshkent)')),
('Toshkent viloyati filial N1 BXMN3', (SELECT id FROM "Department" WHERE name = 'Bank xizmatlari markazlari (Filial N1 Toshkent)'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Kreditlarni boshqarish bo''limi (Bek-ofis Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Bek-ofis (Filial N1 Toshkent)')),
('Mahallabay ishlash bo''limi (Bek-ofis Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Bek-ofis (Filial N1 Toshkent)')),
('Buxgalteriya hisobi va hisoboti bo''limi (Bek-ofis Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Bek-ofis (Filial N1 Toshkent)')),
('Kassa bo''limi (Bek-ofis Filial N1 Toshkent)', (SELECT id FROM "Department" WHERE name = 'Bek-ofis (Filial N1 Toshkent)'));

-- Аналогично для филиалов N2 и N3 (сокращенно, по той же структуре)
-- Samarqand viloyati
INSERT INTO "Department" (name, "parentId") VALUES 
('Samarqand viloyati hududiy boshqarmasi', (SELECT id FROM "Department" WHERE name = 'Qoraqolpog''iston Respublikasi va viloyatlar boshqarmalari'));

-- Andijon viloyati
INSERT INTO "Department" (name, "parentId") VALUES 
('Andijon viloyati hududiy boshqarmasi', (SELECT id FROM "Department" WHERE name = 'Qoraqolpog''iston Respublikasi va viloyatlar boshqarmalari'));

-- Toshkent shahar filiali
INSERT INTO "Department" (name, "parentId") VALUES 
('Toshkent shahar filiali', (SELECT id FROM "Department" WHERE name = 'Qoraqolpog''iston Respublikasi va viloyatlar boshqarmalari')),
('Boshqaruvchi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Toshkent shahar filiali'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Komplaens nazorat guruhi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Front ofis (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Bek ofis (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Muammoli kreditlar bilan ishlash bo''limi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Yuridik xizmat (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Xodimlar bilan ishlash bo''limi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Axborot texnologiyalari va muhofazasi sho''basi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Ijro nazorati va xatlar bilan ishlash sho''basi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Umumiy bo''lim (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)')),
('Investitsiya loyihalarini moliyalashtirish va monitoring qilish bo''limi (Toshkent shahar)', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi (Toshkent shahar)'));

-- Bosh Ofis
INSERT INTO "Department" (name, "parentId") VALUES 
('Boshqaruv Raisi', (SELECT id FROM "Department" WHERE name = 'Bosh Ofis'));

INSERT INTO "Department" (name, "parentId") VALUES 
('Boshqaruv raisining birinchi o''rinbosari v.b.', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi')),
('Boshqaruv raisi o''rinbosari v.b. (1)', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi')),
('Boshqaruv raisi o''rinbosari v.b. (2)', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi')),
('Boshqaruv raisi o''rinbosari v.b. (3)', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi')),
('Boshqaruv raisi o''rinbosari v.b. (4)', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi')),
('Boshqaruvchi direktor - Boshqaruv raisi o''rinbosari v.b.', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi')),
('Yuridik departament (Bosh Ofis)', (SELECT id FROM "Department" WHERE name = 'Boshqaruv Raisi'));

-- Подразделения первого заместителя
INSERT INTO "Department" (name, "parentId") VALUES 
('Suv va ijtimoiy loyihalar markazi', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisining birinchi o''rinbosari v.b.')),
('Mahallabay ishlash departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisining birinchi o''rinbosari v.b.')),
('Hududiy dasturlar monitoringi boshqarmasi', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisining birinchi o''rinbosari v.b.')),
('Matbuot xizmati', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisining birinchi o''rinbosari v.b.'));

-- Подразделения заместителя 1
INSERT INTO "Department" (name, "parentId") VALUES 
('Axborot xavfsizligi departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (1)')),
('Xorijiy hamkorlar bilan ishlash departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (1)')),
('Korporativ biznes departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (1)'));

-- Подразделения заместителя 2
INSERT INTO "Department" (name, "parentId") VALUES 
('Agrosanoat majmuasi korxonalarini moliyalashtirish departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (2)'));

-- Подразделения заместителя 3
INSERT INTO "Department" (name, "parentId") VALUES 
('Risk menejmenti departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (3)')),
('Muammoli kreditlar bilan ishlash departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (3)')),
('Kredit anderraytingi markazi', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (3)')),
('Kreditlarni boshqarish departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (3)')),
('Komplaens nazorat departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (3)'));

-- Подразделения заместителя 4
INSERT INTO "Department" (name, "parentId") VALUES 
('Moliyaviy blok', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (4)')),
('Bank apparati', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (4)')),
('Sho''ba korxonalar', (SELECT id FROM "Department" WHERE name = 'Boshqaruv raisi o''rinbosari v.b. (4)'));

-- Подразделения управляющего директора
INSERT INTO "Department" (name, "parentId") VALUES 
('G''aznachilik departamenti', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi direktor - Boshqaruv raisi o''rinbosari v.b.')),
('Strategiya va transformatsiya majmuasi', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi direktor - Boshqaruv raisi o''rinbosari v.b.')),
('Biznes va raqamli mahsulotlar majmuasi', (SELECT id FROM "Department" WHERE name = 'Boshqaruvchi direktor - Boshqaruv raisi o''rinbosari v.b.'));
