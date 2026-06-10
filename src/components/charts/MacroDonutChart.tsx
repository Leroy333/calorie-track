import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const MacroDonutChart = ({ summaryData }: { summaryData?: any }) => {
  const { summary: reduxSummary } = useSelector((state: RootState) => state.dashboard);
  const summary = summaryData || reduxSummary;
  
  const data = [
    { name: 'Белки', value: Math.round(summary.totalProtein) || 0, color: '#60A5FA' }, // blue-400
    { name: 'Жиры', value: Math.round(summary.totalFat) || 0, color: '#FACC15' }, // yellow-400
    { name: 'Углеводы', value: Math.round(summary.totalCarbs) || 0, color: '#C084FC' }, // purple-400
  ];

  const totalMacros = summary.totalProtein + summary.totalFat + summary.totalCarbs;
  const isDataEmpty = totalMacros === 0;

  const displayData = isDataEmpty 
    ? [{ name: 'Пусто', value: 1, color: '#334155' }] 
    : data.filter(d => d.value > 0); // Прячем нулевые значения

  return (
    <div className="bg-[#1E2128] p-6 rounded-2xl border border-slate-800 flex flex-col h-full w-full min-h-[300px]">
      <h3 className="text-sm font-medium text-white mb-2">Распределение БЖУ</h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={isDataEmpty ? 0 : 4}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {!isDataEmpty && (
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E2128', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [`${value} г`, '']}
              />
            )}
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Центральный текст */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-36px' }}>
          <span className="text-slate-400 text-xs">Всего</span>
          <span className="text-white font-bold text-xl">{Math.round(totalMacros)} г</span>
        </div>
      </div>
    </div>
  );
};
