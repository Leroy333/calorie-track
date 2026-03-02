import { Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/dashboardSlice';

export const Header = () => {
  const user = useSelector((state: RootState) => state.dashboard.user);
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Привет, {user.name}!</h1>
        <p className="text-slate-400 text-sm capitalize">{date}</p>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-white"><Bell size={20} /></button>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск" 
            className="bg-[#1E2128] text-sm text-white rounded-full pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-slate-700" />
      </div>
    </header>
  );
};