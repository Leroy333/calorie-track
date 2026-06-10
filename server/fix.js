const fs = require('fs');
const content = "generator client {
  provider = \\"prisma-client-js\\"
}

datasource db {
  provider = \\"sqlite\\"
  url = \\"file:./dev.db\\"
}

model User {
  id             Int            @id @default(autoincrement())
  name           String
  avatar         String?
  
  // Новые физические параметры
  age            Int?           
  gender         String?        @default(\\"male\\")
  height         Float?         // Рост в см
  weight         Float?         // Вес в к
  activityLevel  Float?         @default(1.55) // Коэффициент активности

  goals          Goal[]         
  summaries      DailySummary[] 
}

// 1) Таблица продуктов (База знаний)
model Product {
  id       Int    @id @default(autoincrement())
  name     String
  category String @default(\\"Базовое\\") // Завтрак, Обед, Перекус, Базовое
  unit     String @default(\\"100г\\")    // \\"100г\\" или \\"1 шт\\"
  calories Float
  protein  Float
  fat      Float
  carbs    Float
  recent   Boolean @default(false)
}

// 2) Таблица приемов пищи
model MealRecord {
  id             Int          @id @default(autoincrement())
  name           String       
  type           String       @default(\\"Перекус\\") // <--- ДОБАВИЛИ ЭТУ СТРОКУ
  calories       Float
  protein        Float
  fat            Float
  carbs          Float
  consumedAt     DateTime     @default(now()) 
  
  dailySummaryId Int
  dailySummary   DailySummary @relation(fields: [dailySummaryId], references: [id], onDelete: Cascade)
}

// 3) Таблица по дням (агрегированная статистика и отклонения)
model DailySummary {
  id               Int          @id @default(autoincrement())
  date             String       // Строка в формате \\"YYYY-MM-DD\\" для удобного поиска
  
  totalCalories    Float        @default(0)
  totalProtein     Float        @default(0)
  totalFat         Float        @default(0)
  totalCarbs       Float        @default(0)
  
  deviationCalories Float       @default(0)
  deviationProtein  Float       @default(0)
  deviationFat      Float       @default(0)
  deviationCarbs    Float       @default(0)
  
  userId           Int
  user             User         @relation(fields: [userId], references: [id])
  meals            MealRecord[]

  @@unique([userId, date])
}

// 4) Таблица по целям (настройки для похудения/набора)
model Goal {
  id             Int     @id @default(autoincrement())
  name           String
  targetCalories Float
  targetProtein  Float
  targetFat      Float
  targetCarbs    Float
  isActive       Boolean @default(false)
  
  userId         Int
  user           User    @relation(fields: [userId], references: [id])
}";
fs.writeFileSync('prisma/schema.prisma', content);
