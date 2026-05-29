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

  // 4. Заполняем данные за весь май 2026 года
  const mockMayData = [
    { day: '01', calories: 2100 }, { day: '02', calories: 2150 }, { day: '03', calories: 2200 },
    { day: '04', calories: 2050 }, { day: '05', calories: 1950 }, { day: '06', calories: 1900 },
    { day: '07', calories: 2100 }, { day: '08', calories: 2300 }, { day: '09', calories: 2400 },
    { day: '10', calories: 2100 }, { day: '11', calories: 2000 }, { day: '12', calories: 1950 },
    { day: '13', calories: 1900 }, { day: '14', calories: 1850 }, { day: '15', calories: 2100 },
    { day: '16', calories: 2200 }, { day: '17', calories: 2150 }, { day: '18', calories: 2300 },
    { day: '19', calories: 2400 }, { day: '20', calories: 2350 }, { day: '21', calories: 2200 },
    { day: '22', calories: 2100 }, { day: '23', calories: 2050 }, { day: '24', calories: 1950 },
    { day: '25', calories: 1900 }, { day: '26', calories: 1850 }, { day: '27', calories: 2000 },
    { day: '28', calories: 2100 }, { day: '29', calories: 2200 }, { day: '30', calories: 2150 },
    { day: '31', calories: 2000 } 
  ];

  for (const data of mockMayData) {
    const date = `2026-05-${data.day}`;
    await prisma.dailySummary.create({
      data: {
        date: date,
        userId: user.id,
        totalCalories: data.calories,
        totalProtein: Math.round(data.calories * 0.3 / 4), // примерно 30% белка
        totalFat: Math.round(data.calories * 0.3 / 9),     // примерно 30% жира
        totalCarbs: Math.round(data.calories * 0.4 / 4),   // примерно 40% углеводов
        deviationCalories: data.calories - 2000, 
        deviationProtein: 0,
        deviationFat: 0,
        deviationCarbs: 0,
        meals: {
          create: [
            { name: 'Тестовый прием пищи', type: 'Обед', calories: data.calories, protein: Math.round(data.calories * 0.3 / 4), fat: Math.round(data.calories * 0.3 / 9), carbs: Math.round(data.calories * 0.4 / 4) }
          ]
        }
      },
    });
  }

  console.log('✅ База данных успешно пересобрана и заполнена тестовыми данными (включая май 2026)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });