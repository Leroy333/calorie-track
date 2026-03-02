import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json()); // Обязательная строчка, чтобы сервер понимал JSON из POST-запросов

// Базовый роут для проверки работоспособности
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает!' });
});

// 1. GET: Получение данных пользователя и его дневной статистики при загрузке страницы
app.get('/api/user/stats', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      include: {
        stats: true, 
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

// 2. POST: Добавление нового приема пищи и обновление макросов
app.post('/api/meals', async (req, res) => {
  const { name, calories, protein, fat, carbs } = req.body;
  
  try {
    const user = await prisma.user.findFirst({ include: { stats: true } });
    
    if (!user || !user.stats) {
      return res.status(404).json({ error: 'Статистика не найдена' });
    }

    const updatedStats = await prisma.dailyStat.update({
      where: { id: user.stats.id },
      data: {
        consumedCalories: { increment: Number(calories) },
        protein: { increment: Number(protein) },
        fat: { increment: Number(fat) },
        carbs: { increment: Number(carbs) },
      }
    });

    res.json(updatedStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при добавлении еды' });
  }
});

// Запуск сервера ВСЕГДА должен быть в самом конце файла!
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});