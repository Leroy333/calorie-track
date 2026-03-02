// server/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: 'Руслан',
      avatar: 'https://i.pravatar.cc/150?img=11',
      stats: {
        create: {
          consumedCalories: 1680,
          targetCalories: 2250,
          protein: 85,
          fat: 62,
          carbs: 210,
          waterCurrent: 8,
          waterTarget: 12,
          steps: 10450,
          sleepMinutes: 435, // 7 часов 15 минут
        }
      }
    }
  });
  console.log('✅ База данных успешно заполнена!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());