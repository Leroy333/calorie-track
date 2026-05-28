import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // 2. Очищаем старые продукты и загружаем базу из CSV
  await prisma.product.deleteMany();
  
  const csvPath = path.join(__dirname, 'products.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  
  // Разбиваем на строки, пропускаем заголовок и отсеиваем пустые строки
  const rows = csvData.split('\n').slice(1).filter(row => row.trim() !== '');
  
  const products = rows.map(row => {
    const [name, category, unit, calories, protein, fat, carbs] = row.split(',');
    return {
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbs: parseFloat(carbs),
    };
  });

  await prisma.product.createMany({
    data: products,
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