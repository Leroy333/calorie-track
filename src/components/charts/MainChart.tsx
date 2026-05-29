import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../../store/dashboardSlice';
import type { AppDispatch, RootState } from '../../store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const MainChart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector((state: RootState) => state.dashboard.history);

  useEffect(() => {
    // Если история пустая, запрашиваем её с сервера
    if (!history || history.length === 0) {
      dispatch(fetchHistory());
    }
  }, [dispatch, history]);

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Получаем текущий год и месяц для фильтрации данных (например, только текущий месяц)
    const currentDate = new Date();
    const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    return history
      .filter((item: any) => item.date.startsWith(currentMonthPrefix)) // Берем только текущий месяц
      .map((item: any) => {
        const dayMatch = item.date.split('-');
        const day = dayMatch.length === 3 ? parseInt(dayMatch[2], 10).toString() : item.date;
        return {
          day,
          calories: item.totalCalories
        };
      })
      .sort((a, b) => parseInt(a.day, 10) - parseInt(b.day, 10)); // Сортируем по дням от 1 до 31
  }, [history]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Шапка графика */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-white">Калории (Месяц)</h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1 text-blue-400">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> Калории (ккал)
          </span>
        </div>
      </div>

      {/* Сам график */}
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            {/* Сетка на фоне */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            
            {/* Оси */}
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
              ticks={['5', '10', '15', '20', '25', '30']}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              domain={[1000, 4000]}
              ticks={[1000, 2000, 3000, 4000]} // Явное указание шагов шкалы
            />
            
            {/* Всплывающая подсказка (Tooltip) */}
            <Tooltip
              contentStyle={{ backgroundColor: '#1E2128', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number | undefined) => [`${value!== 0 ? value : '0'} ккал`, 'Калории']}
              labelFormatter={(label) => `День ${label}`}
            />
            
            {/* Линия калорий (Площадь) */}
            <Area 
              type="monotone" 
              dataKey="calories" 
              stroke="#60A5FA" // blue-400
              fillOpacity={0.1} 
              fill="#60A5FA" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};