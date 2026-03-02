import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flame, Droplets, Footprints, Moon } from 'lucide-react';
import { 
  BarChart, Bar, ResponsiveContainer, Cell,
  PieChart, Pie,
  LineChart, Line
} from 'recharts';

import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { MainChart } from '../components/charts/MainChart';
import { fetchUserData } from '../store/dashboardSlice';
import type { RootState, AppDispatch } from '../store'; 

// --- Моковые данные для истории (пока нет API для графиков за неделю) ---
const weekData = [
  { day: 'Пн', val: 1800 }, { day: 'Вт', val: 2100 }, { day: 'Ср', val: 1950 },
  { day: 'Чт', val: 2300 }, { day: 'Пт', val: 2000 }, { day: 'Сб', val: 2400 }, { day: 'Вс', val: 1700 }
];

const weightHistory = [
  { day: '1', val: 76.5 }, { day: '5', val: 76.2 }, { day: '10', val: 75.8 },
  { day: '15', val: 75.5 }, { day: '20', val: 75.2 }, { day: '25', val: 74.8 }
];

export const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, status } = useSelector((state: RootState) => state.dashboard);

  // Запрашиваем данные при монтировании компонента
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUserData());
    }
  }, [status, dispatch]);

  // Экран загрузки
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="p-8 h-full flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Загрузка данных с сервера...
        </div>
      </div>
    );
  }

  // Экран ошибки
  if (status === 'failed') {
    return (
      <div className="p-8 h-full flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-red-400">
          Ошибка загрузки данных. Убедись, что бэкенд на порту 5000 запущен.
        </div>
      </div>
    );
  }

  // Динамический расчет макросов из БД
  const macroData = [
    { name: 'Углеводы', value: stats.carbs, color: '#3B82F6' }, // blue-500
    { name: 'Белки', value: stats.protein, color: '#2DD4BF' },  // teal-400
    { name: 'Жиры', value: stats.fat, color: '#FB923C' },     // orange-400
  ];

  const totalMacros = stats.carbs + stats.protein + stats.fat;
  const getPercent = (val: number) => totalMacros > 0 ? Math.round((val / totalMacros) * 100) : 0;

  // Форматирование сна из минут в часы и минуты
  const sleepHours = Math.floor(stats.sleepMinutes / 60);
  const sleepMins = stats.sleepMinutes % 60;

  return (
    <div className="p-8 h-full flex flex-col max-w-[1600px] mx-auto overflow-y-auto">
      <Header />

      {/* Основная сетка */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        
        {/* ЛЕВАЯ КОЛОНКА (8 колонок) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Верхние карточки сводки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Карточка Калорий */}
            <Card className="flex flex-col justify-between col-span-1 md:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Потреблено сегодня</h3>
                  <div className="text-3xl font-bold text-white">
                    {stats.consumedCalories} <span className="text-sm text-slate-400 font-normal">/ {stats.targetCalories} ккал</span>
                  </div>
                </div>
                <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                  <Flame size={24} />
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div 
                  className="bg-teal-400 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((stats.consumedCalories / stats.targetCalories) * 100, 100)}%` }}
                ></div>
              </div>
            </Card>

            {/* Карточка Воды */}
            <Card className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Вода</h3>
                  <div className="text-2xl font-bold text-white">
                    {stats.waterCurrent} <span className="text-sm text-slate-400 font-normal">/ {stats.waterTarget} стаканов</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <Droplets size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Главный график */}
          <Card className="flex-1 min-h-[350px]">
            <MainChart />
          </Card>
        </div>

        {/* ПРАВАЯ КОЛОНКА (4 колонки) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Сводка по макронутриентам */}
          <Card className="flex flex-col items-center p-6">
            <h3 className="text-slate-300 font-medium mb-6 w-full text-left">Макронутриенты</h3>
            <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Легенда БЖУ с реальными данными */}
            <div className="flex flex-col w-full text-sm text-slate-300 gap-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div> Углеводы
                </span> 
                <span className="font-medium">{stats.carbs}г <span className="text-slate-500 text-xs">({getPercent(stats.carbs)}%)</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-400"></div> Белки
                </span> 
                <span className="font-medium">{stats.protein}г <span className="text-slate-500 text-xs">({getPercent(stats.protein)}%)</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div> Жиры
                </span> 
                <span className="font-medium">{stats.fat}г <span className="text-slate-500 text-xs">({getPercent(stats.fat)}%)</span></span>
              </div>
            </div>
          </Card>

          {/* Карточки активности и сна */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center text-center p-4">
              <Footprints className="text-teal-400 mb-2" size={24} />
              <span className="text-2xl font-bold text-white mb-1">{stats.steps}</span>
              <span className="text-xs text-slate-400">Шагов</span>
            </Card>
            
            <Card className="flex flex-col items-center text-center p-4">
              <Moon className="text-indigo-400 mb-2" size={24} />
              <span className="text-2xl font-bold text-white mb-1">
                {sleepHours}<span className="text-sm">ч</span> {sleepMins > 0 ? `${sleepMins}м` : ''}
              </span>
              <span className="text-xs text-slate-400">Сон</span>
            </Card>
          </div>

          {/* История веса (мини-график) */}
          <Card className="flex flex-col p-4 flex-1 min-h-[150px]">
            <h4 className="text-xs text-slate-300 font-medium mb-4">История веса</h4>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory}>
                  <Line type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};