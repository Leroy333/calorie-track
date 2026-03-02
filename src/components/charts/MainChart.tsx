import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line
} from 'recharts';

// Моковые данные (в реальности придут из Redux/API)
const data = [
  { day: '1', calories: 2100, weight: 76.5 },
  { day: '4', calories: 2200, weight: 76.2 },
  { day: '8', calories: 1900, weight: 75.8 },
  { day: '12', calories: 2050, weight: 75.5 },
  { day: '16', calories: 2300, weight: 75.2 },
  { day: '20', calories: 1850, weight: 74.8 },
  { day: '24', calories: 2150, weight: 74.5 },
  { day: '28', calories: 1950, weight: 74.2 },
];

export const MainChart = () => {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Шапка графика */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-white">Вес и Калории (Месяц)</h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1 text-teal-400">
            <div className="w-2 h-2 rounded-full bg-teal-400"></div> Вес (кг)
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> Калории (ккал)
          </span>
        </div>
        <div className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-md">
          76.5 → 74.2
        </div>
      </div>

      {/* Сам график */}
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            {/* Сетка на фоне */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            
            {/* Оси */}
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            
            {/* Всплывающая подсказка (Tooltip) */}
            <Tooltip
              contentStyle={{ backgroundColor: '#1E2128', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            
            {/* Линия калорий (Площадь) */}
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="calories" 
              stroke="#60A5FA" // blue-400
              fillOpacity={0.1} 
              fill="#60A5FA" 
              strokeWidth={2}
            />
            
            {/* Линия веса */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="weight" 
              stroke="#2DD4BF" // teal-400
              strokeWidth={2}
              dot={{ r: 3, fill: '#2DD4BF', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};