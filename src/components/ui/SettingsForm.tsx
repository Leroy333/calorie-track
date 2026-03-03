import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateSettings } from '../../store/dashboardSlice';
import type { AppDispatch } from '../../store';
import { Card } from './Card';

interface SettingsFormProps {
  onClose: () => void;
}

export const SettingsForm = ({ onClose }: SettingsFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    gender: 'male',
    age: 24,
    weight: 90,
    height: 180,
    activityLevel: 1.55 // Умеренная (3-5 тренировок)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateSettings({
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: Number(formData.height),
      gender: formData.gender,
      activityLevel: Number(formData.activityLevel),
    }));
    onClose();
  };

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-white">Физические параметры</h3>
      <p className="text-sm text-slate-400">Алгоритм автоматически рассчитает БЖУ для 3 целей.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 ml-1">Пол</label>
            <select 
              className="mt-1 bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-slate-400 ml-1">Возраст</label>
            <input 
              type="number" 
              className="mt-1 bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 ml-1">Вес (кг)</label>
            <input 
              type="number" 
              className="mt-1 bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 ml-1">Рост (см)</label>
            <input 
              type="number" 
              className="mt-1 bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 ml-1">Уровень активности</label>
          <select 
            className="mt-1 bg-[#1E2128] text-white text-sm rounded-lg px-4 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.activityLevel}
            onChange={(e) => setFormData({...formData, activityLevel: Number(e.target.value)})}
          >
            <option value={1.2}>Сидячий образ жизни</option>
            <option value={1.375}>Легкая активность (1-3 дня)</option>
            <option value={1.55}>Умеренная активность (3-5 дней)</option>
            <option value={1.725}>Высокая активность (6-7 дней)</option>
          </select>
        </div>

        <button type="submit" className="mt-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold py-2 rounded-lg transition-colors">
          Рассчитать цели
        </button>
      </form>
    </Card>
  );
};