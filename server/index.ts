import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 5001; // Убедились, что порт 5001

app.use(cors());
app.use(express.json());

// 1. GET: Получение данных юзера, его активной цели и статистики за СЕГОДНЯ
app.get('/api/user/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Получаем дату "YYYY-MM-DD"

    const user = await prisma.user.findFirst({
      include: {
        // Берем только активную цель (например, рекомпозиция)
        goals: { 
          where: { isActive: true } 
        },
        // Берем сводку только за сегодняшний день вместе с едой
        summaries: {
          where: { date: today },   
          include: { meals: true }  
        }
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении данных' });
  }
});

// POST: Добавление приема пищи (с поддержкой прошлых дней)
app.post('/api/meals', async (req, res) => {
  const { name, type, calories, protein, fat, carbs, targetDate, productId } = req.body;
  
  // Железобетонно чистим дату (если вдруг прилетел формат с временем)
  const cleanTargetDate = targetDate ? targetDate.split('T')[0] : null;
  const dateToUse = cleanTargetDate || new Date().toISOString().split('T')[0];

  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    let summary = await prisma.dailySummary.findFirst({
      where: { userId: user.id, date: dateToUse }
    });

    if (!summary) {
      summary = await prisma.dailySummary.create({
        data: { userId: user.id, date: dateToUse }
      });
    }

    await prisma.mealRecord.create({
      data: {
        name,
        type: type || 'Перекус',
        calories,
        protein,
        fat,
        carbs,
        dailySummaryId: summary.id
      }
    });

    await prisma.dailySummary.update({
      where: { id: summary.id },
      data: {
        totalCalories: { increment: calories },
        totalProtein: { increment: protein },
        totalFat: { increment: fat },
        totalCarbs: { increment: carbs },
      }
    });

    if (productId) {
      await prisma.product.update({ where: { id: parseInt(productId) }, data: { recent: true } }).catch(e => console.error(e));
    }

    const updatedUser = await prisma.user.findFirst({
      include: {
        goals: { where: { isActive: true } },
        summaries: { where: { date: new Date().toISOString().split('T')[0] }, include: { meals: true } }
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при добавлении еды' });
  }
});

// PATCH: Быстрая корректировка калорий для активной цели
app.patch('/api/goals/active/calories', async (req, res) => {
  const { calories } = req.body;
  try {
    // Находим пользователя и его активную цель
    const user = await prisma.user.findFirst({
      include: { goals: { where: { isActive: true } } }
    });

    if (!user || user.goals.length === 0) {
      return res.status(404).json({ error: 'Активная цель не найдена' });
    }

    const activeGoal = user.goals[0];
    
    // Обновляем только калории
    const updatedGoal = await prisma.goal.update({
      where: { id: activeGoal.id },
      data: { targetCalories: Number(calories) }
    });

    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении калорий' });
  }
});

// PATCH: Переключение активной цели
app.patch('/api/goals/switch', async (req, res) => {
  const { goalName } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // 1. Делаем все цели неактивными
    await prisma.goal.updateMany({
      where: { userId: user.id },
      data: { isActive: false }
    });

    // 2. Ищем нужную цель (используем contains, чтобы "Набор массы" нашел "Набор массы (+15%)")
    const goals = await prisma.goal.findMany({ where: { userId: user.id } });
    const targetGoal = goals.find(g => g.name.toLowerCase().includes(goalName.toLowerCase()));

    // 3. Активируем её
    if (targetGoal) {
      await prisma.goal.update({
        where: { id: targetGoal.id },
        data: { isActive: true }
      });
    }

    // 4. Возвращаем обновленные данные для дашборда
    const updatedUser = await prisma.user.findFirst({
      include: {
        goals: { where: { isActive: true } },
        summaries: { where: { date: today }, include: { meals: true } }
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при смене цели' });
  }
});

// Обновление настроек пользователя и перерасчет целей
app.put('/api/user/settings', async (req, res) => {
  const { age, height, weight, gender, activityLevel } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // 1. Сохраняем новые параметры в профиль
    await prisma.user.update({
      where: { id: user.id },
      data: {
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        gender,
        activityLevel: Number(activityLevel)
      }
    });

    // 2. Математика: Формула Миффлина — Сан-Жеора
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    
    const bmr = gender === 'male' 
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;

    const tdee = bmr * Number(activityLevel);

    // 3. Распределение макросов (2г белка и 1г жира на кг веса)
    const protein = Math.round(w * 2); 
    const fat = Math.round(w * 1);
    
    // Функция для вычисления углеводов по остаточному принципу
    const calcCarbs = (cals: number) => Math.max(0, Math.round((cals - (protein * 4) - (fat * 9)) / 4));

    // 4. Удаляем старые цели и создаем 3 новые
    await prisma.goal.deleteMany({ where: { userId: user.id } });

    await prisma.goal.createMany({
      data: [
        { name: 'Сушка (-20%)', targetCalories: Math.round(tdee * 0.8), targetProtein: protein, targetFat: fat, targetCarbs: calcCarbs(tdee * 0.8), isActive: false, userId: user.id },
        { name: 'Рекомпозиция', targetCalories: Math.round(tdee), targetProtein: protein, targetFat: fat, targetCarbs: calcCarbs(tdee), isActive: true, userId: user.id },
        { name: 'Набор массы (+15%)', targetCalories: Math.round(tdee * 1.15), targetProtein: protein, targetFat: fat, targetCarbs: calcCarbs(tdee * 1.15), isActive: false, userId: user.id }
      ]
    });

    // 5. Возвращаем обновленные данные (как в GET /api/user/stats)
    const updatedUser = await prisma.user.findFirst({
      include: {
        goals: { where: { isActive: true } },
        summaries: { where: { date: today }, include: { meals: true } }
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении настроек' });
  }
});

// GET: Получение справочника всех продуктов
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { category: 'asc' } // Сразу сортируем по категориям для красивого вывода
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении продуктов' });
  }
});

// PUT: Редактирование продукта в базе знаний
app.put('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, calories, protein, fat, carbs } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { name, calories, protein, fat, carbs }
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении продукта' });
  }
});

// DELETE: Удаление приема пищи из дневника
// DELETE: Удаление приема пищи из дневника
app.delete('/api/meals/:id', async (req, res) => {
  const mealId = parseInt(req.params.id);
  const today = new Date().toISOString().split('T')[0];

  try {
    const mealToDelete = await prisma.mealRecord.findUnique({
      where: { id: mealId }
    });

    if (!mealToDelete) return res.status(404).json({ error: 'Прием пищи не найден' });

    // 1. Сначала удаляем саму запись
    await prisma.mealRecord.delete({ where: { id: mealId } });

    // 2. Достаем все ОСТАВШИЕСЯ приемы пищи за этот день
    const remainingMeals = await prisma.mealRecord.findMany({
      where: { dailySummaryId: mealToDelete.dailySummaryId }
    });

    // 3. Заново считаем чистую сумму (это избавит от багов рассинхрона)
    const newTotals = remainingMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      fat: acc.fat + meal.fat,
      carbs: acc.carbs + meal.carbs,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    // 4. Обновляем сводку за день новыми, точными цифрами
    await prisma.dailySummary.update({
      where: { id: mealToDelete.dailySummaryId },
      data: {
        totalCalories: newTotals.calories,
        totalProtein: newTotals.protein,
        totalFat: newTotals.fat,
        totalCarbs: newTotals.carbs,
      }
    });

    // 5. Возвращаем обновленные данные
    const user = await prisma.user.findFirst({
      include: {
        goals: { where: { isActive: true } },
        summaries: { where: { date: today }, include: { meals: true } }
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении приема пищи' });
  }
});

// GET: Получение истории питания за все дни (для Календаря)
app.get('/api/history', async (req, res) => {
  try {
    // Берем первого пользователя (так как авторизации пока нет)
    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Ищем все записи по дням
    const history = await prisma.dailySummary.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }, // Сортируем: от самых свежих к старым
      include: { meals: true }   // Обязательно подтягиваем список съеденного
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при получении истории' });
  }
});

// PUT: Редактирование съеденного приема пищи (в том числе в прошлом)
app.put('/api/meals/:id', async (req, res) => {
  const mealId = parseInt(req.params.id);
  const { name, type, calories, protein, fat, carbs } = req.body;

  try {
    const meal = await prisma.mealRecord.findUnique({ where: { id: mealId } });
    if (!meal) return res.status(404).json({ error: 'Прием пищи не найден' });

    // 1. Обновляем саму запись
    await prisma.mealRecord.update({
      where: { id: mealId },
      data: { name, type, calories, protein, fat, carbs }
    });

    // 2. Пересчитываем итоги за ТОТ день, к которому привязана еда
    const remainingMeals = await prisma.mealRecord.findMany({
      where: { dailySummaryId: meal.dailySummaryId }
    });

    const newTotals = remainingMeals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
      carbs: acc.carbs + m.carbs,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    // 3. Записываем новые итоги в сводку дня
    await prisma.dailySummary.update({
      where: { id: meal.dailySummaryId },
      data: {
        totalCalories: newTotals.calories,
        totalProtein: newTotals.protein,
        totalFat: newTotals.fat,
        totalCarbs: newTotals.carbs,
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при редактировании приема пищи' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Бэкенд запущен на http://localhost:${PORT}`);
});