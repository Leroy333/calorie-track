import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Очищаем базу перед новым посевом (чтобы не было дублей)
  await prisma.mealRecord.deleteMany();
  await prisma.dailySummary.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Создаем пользователя
  const user = await prisma.user.create({
    data: {
      name: 'Руслан',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruslan',
    },
  });

  // 2. Очищаем старые продукты и создаем твою реальную базу
  await prisma.product.deleteMany();
  
  await prisma.product.createMany({
    data: [
      // ЗАВТРАК
      { name: 'Яйцо куриное С1', category: 'Завтрак', unit: '1 шт', calories: 78, protein: 7, fat: 5.5, carbs: 0.5 },
      { name: 'Карпаччо (нарезка)', category: 'Завтрак', unit: '1 шт', calories: 17, protein: 2, fat: 1, carbs: 0 },
      { name: 'Сыр полутвердый', category: 'Завтрак', unit: '100г', calories: 350, protein: 26, fat: 26, carbs: 0 },
      // Банан 250г (если взвешивал с кожурой, то съедобной части там ~150г, но я посчитал на чистые 250г мякоти)
      { name: 'Банан (крупный)', category: 'Завтрак', unit: '1 шт (250г)', calories: 222, protein: 2.5, fat: 0.8, carbs: 57 },

      // ОБЕД
      { name: 'Куриное филе (в духовке)', category: 'Обед', unit: '100г', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
      { name: 'Картофель (в духовке)', category: 'Обед', unit: '100г', calories: 93, protein: 2.5, fat: 0.2, carbs: 21 },

      // ПЕРЕКУС
      { name: 'Карпаччо филе', category: 'Перекус', unit: '100г', calories: 130, protein: 22, fat: 5, carbs: 0 },
      { name: 'Мороженое Твист', category: 'Перекус', unit: '1 шт', calories: 187, protein: 2.6, fat: 8.25, carbs: 25 },

      // БАЗОВОЕ
      { name: 'Конфета (любимая)', category: 'Базовое', unit: '1 шт (18г)', calories: 70, protein: 0.7, fat: 5, carbs: 13 },
      { name: 'Кусок хлеба', category: 'Базовое', unit: '1 шт', calories: 72, protein: 2.5, fat: 0.8, carbs: 13 },
    ],
  });

  // 3. Создаем цели (одна активная для похудения/рекомпозиции, другая для массы)
  await prisma.goal.createMany({
    data: [
      {
        name: 'Рекомпозиция (Активная)',
        targetCalories: 2000,
        targetProtein: 150,
        targetFat: 65,
        targetCarbs: 200,
        isActive: true,
        userId: user.id,
      },
      {
        name: 'Набор массы',
        targetCalories: 2800,
        targetProtein: 160,
        targetFat: 80,
        targetCarbs: 360,
        isActive: false,
        userId: user.id,
      }
    ]
  });

  // 4. Создаем день (сводку) и привязываем к нему приемы пищи
  const today = new Date().toISOString().split('T')[0]; // Получаем дату в формате YYYY-MM-DD
  
  const dailySummary = await prisma.dailySummary.create({
    data: {
      date: today,
      userId: user.id,
      totalCalories: 455,
      totalProtein: 23,
      totalFat: 28,
      totalCarbs: 26,
      // Пример отклонений (если цель 2000 ккал, а съели 455, то отклонение -1545)
      deviationCalories: -1545, 
      deviationProtein: -127,
      deviationFat: -37,
      deviationCarbs: -174,
      meals: {
        create: [
          { name: 'Яйцо куриное (вареное) 100г', calories: 155, protein: 13, fat: 11, carbs: 1 },
          { name: 'Самса с курицей (слоеное тесто) 100г', calories: 300, protein: 10, fat: 17, carbs: 25 },
        ]
      }
    },
  });

  console.log('✅ База данных успешно пересобрана и заполнена тестовыми данными!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });