import { useState } from 'react';
import { Home, Calendar, Book, Database, Utensils, TrendingUp, Target, User, Settings, Flame, X } from 'lucide-react';
import { MealForm } from '../ui/MealForm'; // Убедись, что путь правильный!

export const Sidebar = () => {
  // Состояние для управления модальным окном
  const [isMealFormOpen, setIsMealFormOpen] = useState(false);

  const menu = [
    { icon: <Home size={18} />, label: 'Дашборд', active: true },
    { icon: <Calendar size={18} />, label: 'Календарь' },
    { 
      icon: <Book size={18} />, 
      label: 'Дневник Питания',
      // Добавляем функцию открытия модалки при клике
      onClick: () => setIsMealFormOpen(true) 
    },
    // ... остальные пункты (можешь вернуть их сюда)
    { icon: <Settings size={18} />, label: 'Настройки' },
  ];

  return (
    <>
      <aside className="w-64 bg-[#1E2128] h-screen text-slate-400 p-4 flex flex-col fixed left-0 top-0 z-40">
        <div className="flex items-center gap-2 text-white font-bold text-xl mb-10 px-2">
          <Flame className="text-orange-500" /> CalorieTrack
        </div>
        <nav className="flex flex-col gap-2">
          {menu.map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick} // Привязываем клик, если он передан в объекте
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.active ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Затемнение фона и само Модальное окно */}
      {isMealFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            {/* Кнопка закрытия (крестик) */}
            <button 
              onClick={() => setIsMealFormOpen(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* Сама форма (передаем ей функцию закрытия) */}
            <MealForm onClose={() => setIsMealFormOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};